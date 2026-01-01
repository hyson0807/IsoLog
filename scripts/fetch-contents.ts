/**
 * Google Custom Search API로 이소티논 관련 콘텐츠를 수집하여 DynamoDB에 저장
 *
 * 사용법:
 *   npx ts-node scripts/fetch-contents.ts
 *
 * 환경 변수 필요:
 *   GOOGLE_API_KEY - Google API 키
 *   GOOGLE_CX - 검색 엔진 ID
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

// 환경 변수
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// 검색 키워드
const KEYWORDS = [
  { keyword: "이소티논 후기", language: "ko" },
  { keyword: "이소티논 부작용", language: "ko" },
  { keyword: "로아큐탄 경험", language: "ko" },
  { keyword: "isotretinoin experience", language: "en" },
  { keyword: "accutane journey", language: "en" },
];

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// URL 해시 생성
function hashUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 12);
}

// Google Custom Search API 호출
async function searchGoogle(
  keyword: string
): Promise<GoogleSearchResult | null> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.error("GOOGLE_API_KEY 또는 GOOGLE_CX가 설정되지 않았습니다.");
    return null;
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword)}&num=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      console.error(`Google API 오류: ${response.status}`, error);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`검색 실패 (${keyword}):`, error);
    return null;
  }
}

// URL 중복 체크
async function isUrlExists(urlHash: string): Promise<boolean> {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      FilterExpression: "urlHash = :urlHash",
      ExpressionAttributeValues: {
        ":pk": "CONTENT",
        ":urlHash": urlHash,
      },
      Limit: 1,
    });

    const result = await docClient.send(command);
    return (result.Items?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

// DynamoDB에 콘텐츠 저장
async function saveContent(
  item: GoogleSearchItem,
  language: string,
  keyword: string
): Promise<boolean> {
  const urlHash = hashUrl(item.link);
  const createdAt = new Date().toISOString();

  // 중복 체크
  const exists = await isUrlExists(urlHash);
  if (exists) {
    console.log(`  ⏭️  중복: ${item.title.substring(0, 30)}...`);
    return false;
  }

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: "CONTENT",
      SK: `${createdAt}#${urlHash}`,
      url: item.link,
      urlHash,
      title: item.title,
      snippet: item.snippet,
      source: item.displayLink,
      thumbnailUrl: item.pagemap?.cse_thumbnail?.[0]?.src || null,
      language,
      searchKeyword: keyword,
      isApproved: true,
      viewCount: 0,
      createdAt,
    },
  });

  try {
    await docClient.send(command);
    console.log(`  ✅ 저장: ${item.title.substring(0, 30)}...`);
    return true;
  } catch (error) {
    console.error(`  ❌ 저장 실패:`, error);
    return false;
  }
}

// 메인 함수
async function main() {
  console.log("🚀 콘텐츠 수집 시작\n");

  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.error("❌ 환경 변수를 설정해주세요:");
    console.error("   export GOOGLE_API_KEY=your_api_key");
    console.error("   export GOOGLE_CX=your_search_engine_id");
    process.exit(1);
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const { keyword, language } of KEYWORDS) {
    console.log(`🔍 검색: "${keyword}" (${language})`);

    const data = await searchGoogle(keyword);
    if (!data || !data.items) {
      console.log("   결과 없음\n");
      continue;
    }

    for (const item of data.items) {
      const saved = await saveContent(item, language, keyword);
      if (saved) {
        totalInserted++;
      } else {
        totalSkipped++;
      }
    }

    console.log("");

    // API 할당량 보호를 위한 딜레이
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("📊 결과:");
  console.log(`   새로 저장: ${totalInserted}건`);
  console.log(`   중복 스킵: ${totalSkipped}건`);
}

// 타입 정의
interface GoogleSearchResult {
  items?: GoogleSearchItem[];
}

interface GoogleSearchItem {
  link: string;
  title: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    cse_thumbnail?: Array<{ src: string }>;
  };
}

// 실행
main().catch(console.error);
