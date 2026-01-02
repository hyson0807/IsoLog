/**
 * 네이버 검색 API로 이소티논 관련 콘텐츠를 수집하여 DynamoDB에 저장
 *
 * 사용법:
 *   npx ts-node scripts/fetch-naver-contents.ts
 *
 * 환경 변수 필요:
 *   NAVER_CLIENT_ID - 네이버 개발자 센터 Client ID
 *   NAVER_CLIENT_SECRET - 네이버 개발자 센터 Client Secret
 *
 * 네이버 개발자 센터에서 애플리케이션 등록:
 *   https://developers.naver.com/apps/#/register
 *   - 사용 API: 검색 선택
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

// 환경 변수
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// 콘텐츠 타입
type ContentType = "article" | "social";

// 검색 타입
type SearchType = "blog" | "cafearticle" | "news";

// 검색 키워드
const SEARCH_KEYWORDS = [
  "이소티논",
  "로아큐탄",
  "이소트레티노인",
  "isotretinoin",
  "accutane",
];

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// URL 해시 생성
function hashUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 12);
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// 네이버 검색 API 호출
async function searchNaver(
  keyword: string,
  searchType: SearchType = "blog",
  start: number = 1,
  display: number = 10
): Promise<NaverSearchResult | null> {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.");
    return null;
  }

  const url = `https://openapi.naver.com/v1/search/${searchType}?query=${encodeURIComponent(keyword)}&display=${display}&start=${start}&sort=date`;

  try {
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`네이버 API 오류: ${response.status}`, error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`검색 실패 (${keyword}):`, error);
    return null;
  }
}

// 네이버 URL을 실제 URL로 변환 (블로그)
function extractRealUrl(item: NaverBlogItem | NaverCafeItem): string {
  // 블로그: bloggerlink가 있으면 원본 블로그 URL 사용
  if ("bloggerlink" in item && item.bloggerlink) {
    return item.link;
  }
  return item.link;
}

// 소스 도메인 추출
function extractSource(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "naver.com";
  }
}

// DynamoDB에 콘텐츠 저장
async function saveContent(
  item: NaverBlogItem | NaverCafeItem | NaverNewsItem,
  searchType: SearchType,
  keyword: string
): Promise<boolean> {
  const url = item.link;
  const urlHash = hashUrl(url);

  // Ban된 URL인지 확인
  try {
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: "CONTENT", SK: urlHash },
      ProjectionExpression: "isBanned",
    });
    const { Item } = await docClient.send(getCommand);
    if (Item?.isBanned === true) {
      console.log(`  🚫 Ban된 URL: ${stripHtml(item.title).substring(0, 30)}...`);
      return false;
    }
  } catch {
    // 아이템이 없으면 계속 진행
  }

  const createdAt = new Date().toISOString();
  const title = stripHtml(item.title);
  const snippet = stripHtml(item.description);

  // 발행일 추출
  let publishedAt: string | null = null;
  if ("postdate" in item && item.postdate) {
    // 블로그: YYYYMMDD 형식
    const d = item.postdate;
    publishedAt = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  } else if ("pubDate" in item && item.pubDate) {
    // 뉴스: RFC 2822 형식
    const date = new Date(item.pubDate);
    if (!isNaN(date.getTime())) {
      publishedAt = date.toISOString().split("T")[0];
    }
  }

  // 콘텐츠 타입 결정
  const contentType: ContentType = searchType === "news" ? "article" : "article";

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: "CONTENT",
      SK: urlHash,
      url,
      urlHash,
      title,
      snippet,
      source: extractSource(url),
      thumbnailUrl: null, // 네이버 API는 썸네일 미제공
      language: "ko",
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
    console.log(`  ✅ 저장: ${title.substring(0, 30)}...`);
    return true;
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      console.log(`  ⏭️  중복: ${title.substring(0, 30)}...`);
      return false;
    }
    console.error(`  ❌ 저장 실패:`, error);
    return false;
  }
}

// 메인 함수
async function main() {
  console.log("🚀 네이버 콘텐츠 수집 시작\n");

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error("❌ 환경 변수를 설정해주세요:");
    console.error("   export NAVER_CLIENT_ID=your_client_id");
    console.error("   export NAVER_CLIENT_SECRET=your_client_secret");
    console.error("\n📌 네이버 개발자 센터에서 애플리케이션 등록:");
    console.error("   https://developers.naver.com/apps/#/register");
    process.exit(1);
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  // 검색 타입별로 수집
  const searchTypes: SearchType[] = ["blog", "cafearticle", "news"];

  for (const searchType of searchTypes) {
    const typeLabel =
      searchType === "blog" ? "📝 블로그" :
      searchType === "cafearticle" ? "☕ 카페" : "📰 뉴스";

    console.log(`\n${typeLabel} 검색\n${"=".repeat(40)}`);

    for (const keyword of SEARCH_KEYWORDS) {
      console.log(`\n🔍 검색: "${keyword}"`);

      const data = await searchNaver(keyword, searchType);
      if (!data || !data.items || data.items.length === 0) {
        console.log("   결과 없음");
        continue;
      }

      console.log(`   ${data.total}건 중 ${data.items.length}건 처리`);

      for (const item of data.items) {
        const saved = await saveContent(item, searchType, keyword);
        if (saved) {
          totalInserted++;
        } else {
          totalSkipped++;
        }
      }

      // API 호출 간격 (네이버 API는 초당 10회 제한)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log("\n" + "=".repeat(40));
  console.log("📊 결과:");
  console.log(`   새로 저장: ${totalInserted}건`);
  console.log(`   중복/스킵: ${totalSkipped}건`);
}

// 타입 정의
interface NaverSearchResult {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: (NaverBlogItem | NaverCafeItem | NaverNewsItem)[];
}

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string; // YYYYMMDD
}

interface NaverCafeItem {
  title: string;
  link: string;
  description: string;
  cafename: string;
  cafeurl: string;
}

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string; // RFC 2822
}

// 실행
main().catch(console.error);
