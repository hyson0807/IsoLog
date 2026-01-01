/**
 * DynamoDB에서 큐레이션 콘텐츠를 가져오는 서비스
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
 * 언어별, 타입별 큐레이션 콘텐츠 가져오기
 */
export async function fetchCuratedContents(
  language: string,
  contentType: ContentType = "article",
  limit: number = 20
): Promise<CuratedContent[]> {
  try {
    const client = getDocClient();

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "language-createdAt-index",
      KeyConditionExpression: "#lang = :lang",
      FilterExpression:
        "(contentType = :contentType OR attribute_not_exists(contentType)) AND (isBanned <> :true OR attribute_not_exists(isBanned)) AND isVerified = :true",
      ExpressionAttributeNames: { "#lang": "language" },
      ExpressionAttributeValues: {
        ":lang": language,
        ":contentType": contentType,
        ":true": true,
      },
      ScanIndexForward: false, // 최신순
      Limit: limit * 2, // FilterExpression 때문에 여유있게 조회
    });

    const { Items } = await client.send(command);

    // contentType이 없는 기존 데이터는 article로 처리
    const filtered = (Items || [])
      .filter((item) => {
        const type = item.contentType || "article";
        return type === contentType;
      })
      .sort((a, b) => {
        // publishedAt이 없으면 뒤로 보냄
        if (!a.publishedAt && b.publishedAt) return 1;
        if (a.publishedAt && !b.publishedAt) return -1;
        // 둘 다 없으면 createdAt 기준
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB.localeCompare(dateA); // 최신순
      })
      .slice(0, limit);

    return filtered.map((item) => ({
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
  } catch (error) {
    console.error("콘텐츠 조회 실패:", error);
    throw error;
  }
}

/**
 * 탭 타입에 따라 콘텐츠 가져오기
 * - all: article + social 모두
 * - article: article만
 * - social: social만
 */
export async function fetchContentsByTab(
  language: string,
  tabType: TabType,
  limit: number = 20
): Promise<CuratedContent[]> {
  let contentTypes: ContentType[];

  switch (tabType) {
    case "all":
      contentTypes = ["article", "social"];
      break;
    case "article":
      contentTypes = ["article"];
      break;
    case "social":
      contentTypes = ["social"];
      break;
    default:
      contentTypes = ["article"];
  }

  // 각 타입별로 병렬 fetch
  const results = await Promise.all(
    contentTypes.map((type) => fetchCuratedContents(language, type, limit))
  );

  // 결과 병합 및 정렬
  const merged = results.flat().sort((a, b) => {
    // publishedAt이 없으면 뒤로 보냄
    if (!a.publishedAt && b.publishedAt) return 1;
    if (a.publishedAt && !b.publishedAt) return -1;
    // 둘 다 없으면 createdAt 기준
    const dateA = a.publishedAt || a.createdAt;
    const dateB = b.publishedAt || b.createdAt;
    return dateB.localeCompare(dateA); // 최신순
  });

  return merged.slice(0, limit);
}
