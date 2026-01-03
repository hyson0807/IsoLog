/**
 * 기존 isVerified=true 아이템에 GSI 필드(verifiedLanguage, publishDate) 추가
 *
 * 사용법:
 *   npx ts-node scripts/migrate-to-verified-gsi.ts
 *
 * 환경 변수 필요:
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function migrateVerifiedItems() {
  console.log("🚀 GSI 마이그레이션 시작\n");

  let totalScanned = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    // isVerified=true인 아이템 스캔
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "isVerified = :true",
      ExpressionAttributeValues: {
        ":true": true,
      },
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const { Items, LastEvaluatedKey } = await docClient.send(scanCommand);
    lastEvaluatedKey = LastEvaluatedKey;

    if (!Items || Items.length === 0) {
      continue;
    }

    totalScanned += Items.length;
    console.log(`📦 ${Items.length}개 아이템 처리 중...`);

    for (const item of Items) {
      const { PK, SK, language, publishedAt, createdAt, verifiedLanguage } = item;

      // 이미 마이그레이션 된 아이템 스킵
      if (verifiedLanguage) {
        console.log(`  ⏭️  스킵 (이미 마이그레이션됨): ${item.title?.substring(0, 30)}...`);
        totalSkipped++;
        continue;
      }

      // GSI 필드 생성
      const newVerifiedLanguage = `VERIFIED#${language}`;
      const newPublishDate = publishedAt || createdAt; // publishedAt 우선, 없으면 createdAt

      try {
        const updateCommand = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK, SK },
          UpdateExpression: "SET verifiedLanguage = :vl, publishDate = :pd",
          ExpressionAttributeValues: {
            ":vl": newVerifiedLanguage,
            ":pd": newPublishDate,
          },
        });

        await docClient.send(updateCommand);
        console.log(`  ✅ 업데이트: ${item.title?.substring(0, 30)}...`);
        console.log(`      verifiedLanguage: ${newVerifiedLanguage}`);
        console.log(`      publishDate: ${newPublishDate}`);
        totalUpdated++;
      } catch (error) {
        console.error(`  ❌ 업데이트 실패:`, error);
      }
    }

    // API 제한 방지
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (lastEvaluatedKey);

  console.log("\n📊 마이그레이션 결과:");
  console.log(`   스캔된 아이템: ${totalScanned}개`);
  console.log(`   업데이트 완료: ${totalUpdated}개`);
  console.log(`   스킵 (이미 처리됨): ${totalSkipped}개`);
}

// 실행
migrateVerifiedItems().catch(console.error);