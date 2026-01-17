/**
 * OpenAI API를 활용하여 미확인 콘텐츠를 AI로 분석하는 배치 스크립트
 *
 * 사용법:
 *   npx ts-node scripts/verify-contents-ai.ts
 *
 * 환경 변수 (.env.local):
 *   OPENAI_API_KEY - OpenAI API 키
 */

const { config } = require("dotenv");
config({ path: ".env.local" });

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const OpenAI = require("openai");

// 환경 변수
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// OpenAI 클라이언트
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 콘텐츠 타입
interface Content {
  PK: string;
  SK: string;
  urlHash: string;
  url: string;
  title: string;
  snippet: string;
  source: string;
  language: string;
  contentType: string;
  isVerified?: boolean;
  isBanned?: boolean;
  aiScore?: number;
  aiReason?: string;
  aiVerdict?: "approve" | "reject" | "review";
  aiAnalyzedAt?: string;
}

// AI 분석 결과 타입
interface AIAnalysisResult {
  score: number;
  verdict: "approve" | "reject" | "review";
  reason: string;
}

// 미분석 콘텐츠 조회 (isVerified=false, isBanned=false, aiAnalyzedAt 없음)
async function fetchUnanalyzedContents(): Promise<Content[]> {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk",
    FilterExpression:
      "(isVerified = :false OR attribute_not_exists(isVerified)) AND " +
      "(isBanned = :false OR attribute_not_exists(isBanned)) AND " +
      "attribute_not_exists(aiAnalyzedAt)",
    ExpressionAttributeValues: {
      ":pk": "CONTENT",
      ":false": false,
    },
  });

  const { Items } = await docClient.send(command);
  return (Items as Content[]) || [];
}

// OpenAI API로 콘텐츠 분석
async function analyzeContent(content: Content): Promise<AIAnalysisResult> {
  const prompt = `당신은 이소티논(이소트레티노인/아큐탄) 복용자를 위한 앱의 콘텐츠 검수 담당자입니다.

다음 콘텐츠가 앱에 게시하기 적합한지 평가해주세요:
- 제목: ${content.title}
- 요약: ${content.snippet || "(요약 없음)"}
- 출처: ${content.source}
- 언어: ${content.language === "ko" ? "한국어" : "영어"}

평가 기준:
1. 이소티논/이소트레티노인/아큐탄/로아큐탄 복용과 관련된 유용한 정보인가?
2. 스팸성 콘텐츠가 아닌가?
3. 상품 판매나 광고 목적의 글이 아닌가?
4. 신뢰할 수 있는 정보인가? (개인 경험 공유도 유용함)

판정 기준:
- approve (80점 이상): 이소티논 복용과 직접 관련된 유용한 정보
- review (50-79점): 관련성이 있으나 검토 필요
- reject (50점 미만): 스팸, 광고, 무관한 콘텐츠

반드시 아래 JSON 형식으로만 응답하세요:
{"score": 0-100, "verdict": "approve|reject|review", "reason": "한 줄 이유(한국어)"}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const resultText = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(resultText) as AIAnalysisResult;

    // 기본값 설정
    return {
      score: Math.max(0, Math.min(100, result.score || 0)),
      verdict: result.verdict || "review",
      reason: result.reason || "분석 결과 없음",
    };
  } catch (error) {
    console.error(`  ❌ AI 분석 실패:`, error);
    return {
      score: 50,
      verdict: "review",
      reason: "AI 분석 오류 - 수동 검토 필요",
    };
  }
}

// DynamoDB에 AI 분석 결과 저장
// 반환값: { success: boolean, autoVerified: boolean, autoBanned: boolean }
async function saveAnalysisResult(
  urlHash: string,
  result: AIAnalysisResult
): Promise<{ success: boolean; autoVerified: boolean; autoBanned: boolean }> {
  const now = new Date().toISOString();
  const autoVerify = result.score >= 80;
  const autoBan = result.score < 50;

  // UpdateExpression 조건부 생성
  let updateExpression =
    "SET aiScore = :score, aiReason = :reason, aiVerdict = :verdict, aiAnalyzedAt = :analyzedAt";

  if (autoVerify) {
    updateExpression += ", isVerified = :verified, verifiedAt = :verifiedAt";
  } else if (autoBan) {
    updateExpression += ", isBanned = :banned, bannedAt = :bannedAt";
  }

  const expressionValues: Record<string, unknown> = {
    ":score": result.score,
    ":reason": result.reason,
    ":verdict": result.verdict,
    ":analyzedAt": now,
  };

  if (autoVerify) {
    expressionValues[":verified"] = true;
    expressionValues[":verifiedAt"] = now;
  } else if (autoBan) {
    expressionValues[":banned"] = true;
    expressionValues[":bannedAt"] = now;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: "CONTENT", SK: urlHash },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
  });

  try {
    await docClient.send(command);
    return { success: true, autoVerified: autoVerify, autoBanned: autoBan };
  } catch (error) {
    console.error(`  ❌ 저장 실패:`, error);
    return { success: false, autoVerified: false, autoBanned: false };
  }
}

// 결과 이모지
function getVerdictEmoji(verdict: string): string {
  switch (verdict) {
    case "approve":
      return "✅";
    case "reject":
      return "❌";
    default:
      return "🔍";
  }
}

// 메인 함수
async function main() {
  console.log("🤖 AI 콘텐츠 검증 시작\n");

  if (!OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY 환경 변수를 설정해주세요.");
    console.error("   .env.local 파일에 OPENAI_API_KEY=sk-... 추가");
    process.exit(1);
  }

  // 미분석 콘텐츠 조회
  console.log("📋 미분석 콘텐츠 조회 중...\n");
  const contents = await fetchUnanalyzedContents();

  if (contents.length === 0) {
    console.log("✨ 분석할 콘텐츠가 없습니다.\n");
    return;
  }

  console.log(`📊 총 ${contents.length}개 콘텐츠 분석 예정\n`);

  let approved = 0;
  let rejected = 0;
  let review = 0;
  let autoApproved = 0;
  let autoBanned = 0;

  // 각 콘텐츠 분석
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i];
    console.log(
      `[${i + 1}/${contents.length}] ${content.title.substring(0, 40)}...`
    );

    // AI 분석
    const result = await analyzeContent(content);
    console.log(
      `  ${getVerdictEmoji(result.verdict)} ${result.verdict} (${result.score}점): ${result.reason}`
    );

    // 결과 저장
    const { success, autoVerified, autoBanned: wasBanned } =
      await saveAnalysisResult(content.urlHash, result);
    if (!success) {
      console.log("  ⚠️ 저장 실패, 다음으로 진행\n");
      continue;
    }

    // 자동 승인/차단 로그
    if (autoVerified) {
      console.log("  🎉 자동 승인됨 (80점 이상)");
      autoApproved++;
    } else if (wasBanned) {
      console.log("  🚫 자동 차단됨 (50점 미만)");
      autoBanned++;
    }

    // 통계
    if (result.verdict === "approve") approved++;
    else if (result.verdict === "reject") rejected++;
    else review++;

    console.log("");

    // Rate limit 방지 (약 1초 대기)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 결과 요약
  console.log("📊 분석 완료:");
  console.log(`   ✅ Approve: ${approved}개 (🎉 자동 승인: ${autoApproved}개)`);
  console.log(`   🔍 Review:  ${review}개`);
  console.log(`   ❌ Reject:  ${rejected}개 (🚫 자동 차단: ${autoBanned}개)`);
}

// 실행
main().catch(console.error);
