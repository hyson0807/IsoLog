/**
 * DynamoDB에서 큐레이션 콘텐츠를 가져오는 서비스
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// 콘텐츠 타입
export interface CuratedContent {
  url: string;
  title: string;
  snippet: string;
  source: string;
  thumbnailUrl?: string | null;
  language: string;
  createdAt: string;
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
 * 언어별 큐레이션 콘텐츠 가져오기
 */
export async function fetchCuratedContents(
  language: string,
  limit: number = 20
): Promise<CuratedContent[]> {
  try {
    const client = getDocClient();

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "language-createdAt-index",
      KeyConditionExpression: "#lang = :lang",
      ExpressionAttributeNames: { "#lang": "language" },
      ExpressionAttributeValues: { ":lang": language },
      ScanIndexForward: false, // 최신순
      Limit: limit,
    });

    const { Items } = await client.send(command);

    return (Items || []).map((item) => ({
      url: item.url,
      title: item.title,
      snippet: item.snippet,
      source: item.source,
      thumbnailUrl: item.thumbnailUrl,
      language: item.language,
      createdAt: item.createdAt,
    }));
  } catch (error) {
    console.error("콘텐츠 조회 실패:", error);
    throw error;
  }
}
