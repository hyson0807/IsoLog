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
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

// 환경 변수
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// 콘텐츠 타입
type ContentType = "article" | "social";

// 소셜 미디어 도메인
const SOCIAL_DOMAINS = [
  "youtube.com", "youtu.be",
  "instagram.com",
  "twitter.com", "x.com",
  "tiktok.com",
];

// 한국어 콘텐츠 허용 도메인 (스팸 사이트 필터링용)
const KO_ALLOWED_DOMAINS = [
  // 한국 도메인
  ".kr",
  // 주요 한국 플랫폼
  "naver.com",
  "daum.net",
  "tistory.com",
  "brunch.co.kr",
  "dcinside.com",
  // 글로벌 플랫폼 (한국어 콘텐츠도 허용)
  "medium.com",
  "youtube.com",
  "youtu.be",
  "instagram.com",
  "twitter.com",
  "x.com",
];

// 한국어 검색용 site 필터 (스팸 방지)
const KO_SITE_FILTER = "site:*.kr OR site:naver.com OR site:tistory.com OR site:brunch.co.kr OR site:dcinside.com";

// 검색 키워드 (블로그/커뮤니티)
const ARTICLE_KEYWORDS = [
  { keyword: `이소티논 ${KO_SITE_FILTER}`, language: "ko" },
  { keyword: `로아큐탄 ${KO_SITE_FILTER}`, language: "ko" },
  { keyword: "isotretinoin", language: "en" },
  { keyword: "accutane", language: "en" },
];

// 소셜 미디어 검색 키워드 (YouTube 중심)
const SOCIAL_KEYWORDS = [
  { keyword: "이소티논 site:youtube.com", language: "ko" },
  { keyword: "로아큐탄 site:youtube.com", language: "ko" },
  { keyword: "isotretinoin", language: "en" },
  { keyword: "accutane", language: "en" },
];

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// URL 해시 생성
function hashUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 12);
}

// URL이 소셜 미디어인지 확인
function isSocialUrl(url: string): boolean {
  return SOCIAL_DOMAINS.some((domain) => url.includes(domain));
}

// 언어별 허용 도메인 확인 (스팸 필터링)
function isAllowedDomain(url: string, language: string): boolean {
  // 영어는 제한 없음
  if (language === "en") return true;

  // 한국어는 화이트리스트 체크
  return KO_ALLOWED_DOMAINS.some((domain) => url.includes(domain));
}

// Google Custom Search API 호출
async function searchGoogle(
  keyword: string,
  searchType: "web" | "news" | "social" = "web"
): Promise<GoogleSearchResult | null> {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.error("GOOGLE_API_KEY 또는 GOOGLE_CX가 설정되지 않았습니다.");
    return null;
  }

  // dateRestrict=w1: 지난 1주일 내 글만, sort=date: 최신순 정렬 (매일 실행용)
  let url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword)}&num=10&dateRestrict=w1&sort=date`;

  if (searchType === "news") {
    url += "&tbm=nws";
  } else if (searchType === "social") {
    // 소셜 미디어 검색 (YouTube, Instagram, Twitter, TikTok)
    url += "&tbm=vid";
  }

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

// DynamoDB에 콘텐츠 저장
async function saveContent(
  item: GoogleSearchItem,
  language: string,
  keyword: string,
  contentType: ContentType
): Promise<boolean> {
  const urlHash = hashUrl(item.link);

  // Ban된 URL인지 확인
  try {
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: "CONTENT", SK: urlHash },
      ProjectionExpression: "isBanned",
    });
    const { Item } = await docClient.send(getCommand);
    if (Item?.isBanned === true) {
      console.log(`  🚫 Ban된 URL: ${item.title.substring(0, 30)}...`);
      return false;
    }
  } catch {
    // 아이템이 없으면 계속 진행
  }

  const createdAt = new Date().toISOString();

  // snippet에서 발행일 추출
  const { date: extractedDate, cleanSnippet } = extractDateFromSnippet(item.snippet);

  // 발행일: snippet에서 추출 또는 metatags에서 가져오기
  const metatags = item.pagemap?.metatags?.[0];
  const publishedAt = extractedDate
    || metatags?.["article:published_time"]?.split("T")[0]
    || metatags?.date
    || null;

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: "CONTENT",
      SK: urlHash,
      url: item.link,
      urlHash,
      title: item.title,
      snippet: cleanSnippet,
      source: item.displayLink,
      thumbnailUrl: item.pagemap?.cse_thumbnail?.[0]?.src || null,
      language,
      contentType,
      searchKeyword: keyword,
      publishedAt,
      isVerified: false, // 관리자 페이지에서 true로 변경해야 앱에 노출됨
      viewCount: 0,
      createdAt,
    },
    ConditionExpression: "attribute_not_exists(SK)",
  });

  try {
    await docClient.send(command);
    console.log(`  ✅ 저장: ${item.title.substring(0, 30)}...`);
    return true;
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      console.log(`  ⏭️  중복: ${item.title.substring(0, 30)}...`);
      return false;
    }
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

  // 1. 블로그/커뮤니티 글 수집 (소셜 미디어 제외)
  console.log("📝 블로그/커뮤니티 글 수집\n");
  for (const { keyword, language } of ARTICLE_KEYWORDS) {
    console.log(`🔍 검색: "${keyword}" (${language})`);

    const data = await searchGoogle(keyword, "web");
    if (!data || !data.items) {
      console.log("   결과 없음\n");
      continue;
    }

    for (const item of data.items) {
      if (isSocialUrl(item.link)) {
        console.log(`  ⏭️  소셜 제외: ${item.title.substring(0, 30)}...`);
        totalSkipped++;
        continue;
      }
      if (!isAllowedDomain(item.link, language)) {
        console.log(`  🚫 스팸 제외: ${item.displayLink} - ${item.title.substring(0, 25)}...`);
        totalSkipped++;
        continue;
      }
      const saved = await saveContent(item, language, keyword, "article");
      if (saved) {
        totalInserted++;
      } else {
        totalSkipped++;
      }
    }

    console.log("");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 2. 소셜 미디어 수집
  console.log("📱 소셜 미디어 수집\n");
  for (const { keyword, language } of SOCIAL_KEYWORDS) {
    console.log(`🔍 소셜 검색: "${keyword}" (${language})`);

    const data = await searchGoogle(keyword, "social");
    if (!data || !data.items) {
      console.log("   결과 없음\n");
      continue;
    }

    for (const item of data.items) {
      // 소셜 도메인이 아니면 스킵
      if (!isSocialUrl(item.link)) {
        console.log(`  ⏭️  비소셜 제외: ${item.title.substring(0, 30)}...`);
        totalSkipped++;
        continue;
      }
      if (!isAllowedDomain(item.link, language)) {
        console.log(`  🚫 스팸 제외: ${item.displayLink} - ${item.title.substring(0, 25)}...`);
        totalSkipped++;
        continue;
      }
      const saved = await saveContent(item, language, keyword, "social");
      if (saved) {
        totalInserted++;
      } else {
        totalSkipped++;
      }
    }

    console.log("");
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
    metatags?: Array<{
      "article:published_time"?: string;
      "og:updated_time"?: string;
      date?: string;
    }>;
  };
}

// snippet에서 날짜 추출
function extractDateFromSnippet(snippet: string): { date: string | null; cleanSnippet: string } {
  const now = new Date();

  // 상대적 시간 패턴: "7 hours ago ...", "1 day ago ...", "2 days ago ..."
  const relativePattern = /^(\d+)\s+(hour|hours|day|days|week|weeks|month|months)\s+ago\s*\.{3}\s*/i;
  let match = snippet.match(relativePattern);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const date = new Date(now);

    if (unit.startsWith("hour")) {
      date.setHours(date.getHours() - num);
    } else if (unit.startsWith("day")) {
      date.setDate(date.getDate() - num);
    } else if (unit.startsWith("week")) {
      date.setDate(date.getDate() - num * 7);
    } else if (unit.startsWith("month")) {
      date.setMonth(date.getMonth() - num);
    }

    return {
      date: date.toISOString().split("T")[0],
      cleanSnippet: snippet.replace(relativePattern, "")
    };
  }

  // 한국어 날짜 패턴: "2024. 1. 15. —" 또는 "2024. 01. 15 —"
  const koPattern = /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)\s*(\.{3}|[—\-·])\s*/;
  match = snippet.match(koPattern);
  if (match) {
    const parts = match[1].split(".").map((p) => p.trim()).filter(Boolean);
    const dateStr = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    return { date: dateStr, cleanSnippet: snippet.replace(koPattern, "") };
  }

  // 영어 날짜 패턴: "Jan 15, 2024 —" 또는 "January 15, 2024 ..."
  const enPattern = /^([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\s*(\.{3}|[—\-·])\s*/;
  match = snippet.match(enPattern);
  if (match) {
    const parsed = new Date(match[1]);
    if (!isNaN(parsed.getTime())) {
      return { date: parsed.toISOString().split("T")[0], cleanSnippet: snippet.replace(enPattern, "") };
    }
  }

  // ISO 날짜 패턴: "2024-01-15 —" 또는 "2024-01-15 ..."
  const isoPattern = /^(\d{4}-\d{2}-\d{2})\s*(\.{3}|[—\-·])\s*/;
  match = snippet.match(isoPattern);
  if (match) {
    return { date: match[1], cleanSnippet: snippet.replace(isoPattern, "") };
  }

  return { date: null, cleanSnippet: snippet };
}

// 실행
main().catch(console.error);
