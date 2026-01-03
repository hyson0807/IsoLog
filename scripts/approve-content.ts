/**
 * 콘텐츠 승인/승인취소 스크립트
 * GSI 필드(verifiedLanguage, publishDate)도 함께 관리
 *
 * 사용법:
 *   # 미승인 콘텐츠 목록 확인
 *   npx ts-node scripts/approve-content.ts --list
 *
 *   # 콘텐츠 승인 (SK로 지정)
 *   npx ts-node scripts/approve-content.ts --approve <SK>
 *
 *   # 콘텐츠 승인 취소
 *   npx ts-node scripts/approve-content.ts --unapprove <SK>
 *
 *   # 여러 개 한번에 승인 (쉼표로 구분)
 *   npx ts-node scripts/approve-content.ts --approve <SK1>,<SK2>,<SK3>
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
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "isolog-curated-contents";
const AWS_REGION = "us-east-1";

// DynamoDB 클라이언트
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// 미승인 콘텐츠 목록 조회
async function listPendingContents() {
  console.log("📋 미승인 콘텐츠 목록\n");

  let lastEvaluatedKey: Record<string, any> | undefined;
  let total = 0;

  do {
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        "(isVerified = :false OR attribute_not_exists(isVerified)) AND (isBanned <> :true OR attribute_not_exists(isBanned))",
      ExpressionAttributeValues: {
        ":false": false,
        ":true": true,
      },
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const { Items, LastEvaluatedKey } = await docClient.send(scanCommand);
    lastEvaluatedKey = LastEvaluatedKey;

    if (Items) {
      for (const item of Items) {
        total++;
        console.log(`[${total}] SK: ${item.SK}`);
        console.log(`    언어: ${item.language} | 타입: ${item.contentType || "article"}`);
        console.log(`    제목: ${item.title}`);
        console.log(`    출처: ${item.source}`);
        console.log(`    발행일: ${item.publishedAt || item.createdAt}`);
        console.log(`    URL: ${item.url}`);
        console.log("");
      }
    }
  } while (lastEvaluatedKey);

  console.log(`\n총 ${total}개의 미승인 콘텐츠`);
}

// 콘텐츠 승인
async function approveContent(skList: string[]) {
  console.log("✅ 콘텐츠 승인 시작\n");

  for (const sk of skList) {
    try {
      // 먼저 아이템 조회
      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: "CONTENT", SK: sk },
      });

      const { Item } = await docClient.send(getCommand);

      if (!Item) {
        console.log(`❌ SK "${sk}" 아이템을 찾을 수 없음`);
        continue;
      }

      const { language, publishedAt, createdAt } = Item;

      // GSI 필드 생성
      const verifiedLanguage = `VERIFIED#${language}`;
      const publishDate = publishedAt || createdAt;

      // 승인 + GSI 필드 업데이트
      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: "CONTENT", SK: sk },
        UpdateExpression:
          "SET isVerified = :true, verifiedLanguage = :vl, publishDate = :pd",
        ExpressionAttributeValues: {
          ":true": true,
          ":vl": verifiedLanguage,
          ":pd": publishDate,
        },
      });

      await docClient.send(updateCommand);
      console.log(`✅ 승인 완료: ${Item.title?.substring(0, 40)}...`);
      console.log(`   verifiedLanguage: ${verifiedLanguage}`);
      console.log(`   publishDate: ${publishDate}`);
    } catch (error) {
      console.error(`❌ 승인 실패 (${sk}):`, error);
    }
  }
}

// 콘텐츠 승인 취소
async function unapproveContent(skList: string[]) {
  console.log("🚫 콘텐츠 승인 취소 시작\n");

  for (const sk of skList) {
    try {
      // GSI 필드 제거 + isVerified = false
      const updateCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: "CONTENT", SK: sk },
        UpdateExpression:
          "SET isVerified = :false REMOVE verifiedLanguage, publishDate",
        ExpressionAttributeValues: {
          ":false": false,
        },
      });

      await docClient.send(updateCommand);
      console.log(`🚫 승인 취소 완료: ${sk}`);
    } catch (error) {
      console.error(`❌ 승인 취소 실패 (${sk}):`, error);
    }
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--list") {
    await listPendingContents();
  } else if (args[0] === "--approve" && args[1]) {
    const skList = args[1].split(",").map((s) => s.trim());
    await approveContent(skList);
  } else if (args[0] === "--unapprove" && args[1]) {
    const skList = args[1].split(",").map((s) => s.trim());
    await unapproveContent(skList);
  } else {
    console.log("사용법:");
    console.log("  npx ts-node scripts/approve-content.ts --list");
    console.log("  npx ts-node scripts/approve-content.ts --approve <SK>");
    console.log("  npx ts-node scripts/approve-content.ts --unapprove <SK>");
  }
}

// 실행
main().catch(console.error);