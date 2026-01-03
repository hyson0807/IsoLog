/**
 * DynamoDB에서 큐레이션 콘텐츠를 가져오는 서비스
 * GSI: verifiedLanguage-publishDate-index 사용 (승인된 글만 정확히 조회)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// 콘텐츠 타입 (DB에 저장된 실제 타입)
export type ContentType = "article" | "social";

// UI 탭 타입
export type TabType = "all" | "article" | "social";

export interface CuratedContent {
  url: string;
  title: string;
  snippet: string;
  source: string;
  thumbnailUrl?: string | null;
  language: string;
  contentType?: ContentType;
  publishedAt?: string | null;
  createdAt: string;
}

// 페이지네이션 결과 타입
export interface FetchResult {
  items: CuratedContent[];
  lastKey: Record<string, any> | null;
}

// snippet 앞의 날짜를 제거하는 함수 (기존 데이터 호환용)
function cleanSnippetDate(snippet: string): string {
  // 상대적 시간: "7 hours ago ..."
  const relativePattern =
    /^(\d+)\s+(hour|hours|day|days|week|weeks|month|months)\s+ago\s*\.{3}\s*/i;
  if (relativePattern.test(snippet)) {
    return snippet.replace(relativePattern, "");
  }

  // 한국어: "2024. 1. 15. —"
  const koPattern = /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.?)\s*(\.{3}|[—\-·])\s*/;
  if (koPattern.test(snippet)) {
    return snippet.replace(koPattern, "");
  }

  // 영어: "Dec 25, 2024 ..." 또는 "Dec 25, 2024 —"
  const enPattern = /^([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\s*(\.{3}|[—\-·])\s*/;
  if (enPattern.test(snippet)) {
    return snippet.replace(enPattern, "");
  }

  // ISO: "2024-01-15 —" 또는 "2024-01-15 ..."
  const isoPattern = /^(\d{4}-\d{2}-\d{2})\s*(\.{3}|[—\-·])\s*/;
  if (isoPattern.test(snippet)) {
    return snippet.replace(isoPattern, "");
  }

  return snippet;
}

// 개발용 AWS 자격 증명 (프로덕션에서는 API Gateway 사용 권장)
const AWS_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY;

// DynamoDB 클라이언트 (싱글톤)
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const client = new DynamoDBClient({
      region: AWS_REGION,
      credentials: AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
    docClient = DynamoDBDocumentClient.from(client);
  }
  return docClient;
}

/**
 * 언어별 승인된 콘텐츠 가져오기 (GSI 사용, 페이지네이션 지원)
 * GSI: verifiedLanguage-publishDate-index
 */
export async function fetchVerifiedContents(
  language: string,
  limit: number = 20,
  lastKey?: Record<string, any> | null,
  contentType?: ContentType
): Promise<FetchResult> {
  try {
    const client = getDocClient();

    // GSI 쿼리: VERIFIED#{language}로 승인된 글만 조회
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "verifiedLanguage-publishDate-index",
      KeyConditionExpression: "verifiedLanguage = :vl",
      // contentType 필터 (있으면 적용)
      ...(contentType && {
        FilterExpression:
          "(contentType = :contentType OR attribute_not_exists(contentType)) AND (isBanned <> :true OR attribute_not_exists(isBanned))",
        ExpressionAttributeValues: {
          ":vl": `VERIFIED#${language}`,
          ":contentType": contentType,
          ":true": true,
        },
      }),
      ...(!contentType && {
        FilterExpression:
          "isBanned <> :true OR attribute_not_exists(isBanned)",
        ExpressionAttributeValues: {
          ":vl": `VERIFIED#${language}`,
          ":true": true,
        },
      }),
      ScanIndexForward: false, // 최신순 (publishDate 내림차순)
      Limit: contentType ? limit * 2 : limit, // contentType 필터 있으면 여유있게
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    });

    const { Items, LastEvaluatedKey } = await client.send(command);

    // contentType 필터링 (FilterExpression으로 미리 필터되지만 안전하게)
    let filtered = Items || [];
    if (contentType) {
      filtered = filtered
        .filter((item) => {
          const type = item.contentType || "article";
          return type === contentType;
        })
        .slice(0, limit);
    }

    const items: CuratedContent[] = filtered.map((item) => ({
      url: item.url,
      title: item.title,
      snippet: cleanSnippetDate(item.snippet),
      source: item.source,
      thumbnailUrl: item.thumbnailUrl,
      language: item.language,
      contentType: item.contentType || "article",
      publishedAt: item.publishedAt || null,
      createdAt: item.createdAt,
    }));

    return {
      items,
      lastKey: LastEvaluatedKey || null,
    };
  } catch (error) {
    console.error("콘텐츠 조회 실패:", error);
    throw error;
  }
}

/**
 * 탭 타입에 따라 콘텐츠 가져오기 (페이지네이션 지원)
 * - all: article + social 모두
 * - article: article만
 * - social: social만
 */
export async function fetchContentsByTab(
  language: string,
  tabType: TabType,
  limit: number = 20,
  lastKey?: Record<string, any> | null
): Promise<FetchResult> {
  // all 탭: contentType 필터 없이 모두 조회
  if (tabType === "all") {
    return fetchVerifiedContents(language, limit, lastKey);
  }

  // article 또는 social 탭: contentType 필터 적용
  return fetchVerifiedContents(language, limit, lastKey, tabType as ContentType);
}

// ============================================================
// 레거시 함수 (하위 호환성용, 새 코드에서는 fetchContentsByTab 사용)
// ============================================================

/**
 * @deprecated fetchContentsByTab 사용 권장
 */
export async function fetchCuratedContents(
  language: string,
  contentType: ContentType = "article",
  limit: number = 20
): Promise<CuratedContent[]> {
  const result = await fetchVerifiedContents(language, limit, null, contentType);
  return result.items;
}
