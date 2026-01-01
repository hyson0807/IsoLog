# 콘텐츠 큐레이션 시스템

외부의 이소티논 관련 유용한 콘텐츠를 자동으로 수집하여 앱에서 보여주는 기능.

## 개요

### 목표
- 1인 개발자가 직접 커뮤니티를 운영하지 않고도 유용한 정보 제공
- 최소 비용으로 MVP 구현 후 점진적 발전

### 핵심 원칙
1. **AI 없이 시작**: Google 검색 snippet 그대로 활용
2. **서버리스**: 관리 부담 최소화
3. **무료 티어 최대 활용**: 비용 0원 목표

---

## 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│ Supabase Edge   │────▶│  Supabase DB    │
│  (Cron: 1일 1회)│     │ Functions       │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        │
                        ┌─────────────────┐            │
                        │ Google Custom   │            │
                        │ Search API      │            │
                        └─────────────────┘            │
                                                       ▼
                                              ┌─────────────────┐
                                              │   IsoLog App    │
                                              │ (React Native)  │
                                              └─────────────────┘
```

---

## 대안 아키텍처: AWS 완결 구성

AWS 서비스만으로 구성하는 방식. AWS 경험이 있거나 확장성을 중시한다면 추천.

### 구성도

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ AWS EventBridge │────▶│   AWS Lambda    │────▶│ AWS DynamoDB    │
│ (Cron: 1일 1회) │     │ (Node.js/Python)│     │   (NoSQL)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                        │
                               ▼                        │
                        ┌─────────────────┐            │
                        │ Google Custom   │            │
                        │ Search API      │            │
                        └─────────────────┘            │
                                                       ▼
                                              ┌─────────────────┐
                                              │   IsoLog App    │
                                              │ (React Native)  │
                                              └─────────────────┘
```

### AWS 서비스 비교

| 서비스 | 역할 | 무료 티어 |
|--------|------|----------|
| **EventBridge** | Cron 스케줄러 | 무료 |
| **Lambda** | 함수 실행 | 월 100만 호출, 40만 GB-초 |
| **DynamoDB** | 데이터 저장 | **영구 무료** 25GB, 월 2억 읽기/쓰기 |

### AWS DB 옵션 비교

| DB | 유형 | 무료 티어 | 이후 비용 | 추천 |
|----|------|----------|----------|------|
| **RDS** | PostgreSQL/MySQL | 12개월만 무료 | 월 $15~30 | ❌ |
| **Aurora Serverless** | PostgreSQL/MySQL | 없음 | 비쌈 | ❌ |
| **DynamoDB** | NoSQL | **영구 무료** (25GB) | 거의 무료 | ✅ |

### DynamoDB 선택 이유

- **영구 무료 티어**: 25GB 저장, 월 2억 읽기/쓰기
- **서버리스**: 관리 불필요, 자동 스케일링
- **Lambda와 찰떡 궁합**: AWS SDK로 바로 연결
- 단점: NoSQL이라 복잡한 쿼리 어려움 (이 프로젝트엔 충분)

### DynamoDB 테이블 설계

```javascript
// 테이블명: isolog-curated-contents

// Primary Key
{
  PK: "CONTENT",                    // Partition Key (고정값)
  SK: "2024-01-15T06:00:00Z#abc123" // Sort Key (createdAt#urlHash)
}

// Attributes
{
  url: "https://blog.example.com/isotretinoin-review",
  urlHash: "abc123",                // URL의 MD5 해시 (중복 체크용)
  title: "이소티논 3개월 후기",
  snippet: "이소티논을 복용한 지 3개월이 되었습니다...",
  source: "blog.example.com",
  thumbnailUrl: "https://...",
  language: "ko",                   // 'ko' | 'en'
  searchKeyword: "이소티논 후기",
  isApproved: true,
  viewCount: 0,
  createdAt: "2024-01-15T06:00:00Z"
}

// GSI (Global Secondary Index) - 언어별 최신순 조회
// GSI Name: language-createdAt-index
// GSI-PK: language
// GSI-SK: createdAt
```

### AWS Lambda 코드 (Node.js)

```javascript
// lambda/fetch-contents/index.mjs
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_ENGINE_ID;
const TABLE_NAME = process.env.TABLE_NAME || 'isolog-curated-contents';

const KEYWORDS = [
  { keyword: '이소티논 후기', language: 'ko' },
  { keyword: '이소티논 부작용', language: 'ko' },
  { keyword: 'isotretinoin experience', language: 'en' },
  { keyword: 'accutane journey', language: 'en' },
];

function hashUrl(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 12);
}

async function searchGoogle(keyword) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword)}&num=5`;
  const response = await fetch(url);
  return response.json();
}

async function saveContent(item, language, keyword) {
  const urlHash = hashUrl(item.link);
  const createdAt = new Date().toISOString();

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: 'CONTENT',
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
    ConditionExpression: 'attribute_not_exists(urlHash)', // 중복 방지
  });

  try {
    await docClient.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return false; // 이미 존재
    }
    throw error;
  }
}

export const handler = async (event) => {
  let inserted = 0;

  for (const { keyword, language } of KEYWORDS) {
    const data = await searchGoogle(keyword);

    for (const item of data.items || []) {
      const saved = await saveContent(item, language, keyword);
      if (saved) inserted++;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ inserted }),
  };
};
```

### EventBridge 스케줄 설정

```json
// EventBridge Rule (AWS Console 또는 CloudFormation)
{
  "Name": "isolog-fetch-contents-daily",
  "ScheduleExpression": "cron(0 21 * * ? *)",  // UTC 21:00 = KST 06:00
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:ap-northeast-2:123456789:function:fetch-contents",
      "Id": "fetch-contents-lambda"
    }
  ]
}
```

### AWS CLI로 배포

```bash
# 1. DynamoDB 테이블 생성
aws dynamodb create-table \
  --table-name isolog-curated-contents \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=language,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "[{\"IndexName\":\"language-createdAt-index\",\"KeySchema\":[{\"AttributeName\":\"language\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" \
  --billing-mode PAY_PER_REQUEST

# 2. Lambda 함수 생성 (ZIP 배포)
zip -r function.zip index.mjs node_modules/
aws lambda create-function \
  --function-name fetch-contents \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::123456789:role/lambda-dynamodb-role \
  --environment "Variables={GOOGLE_API_KEY=xxx,GOOGLE_SEARCH_ENGINE_ID=xxx}"

# 3. EventBridge 규칙 생성
aws events put-rule \
  --name isolog-fetch-contents-daily \
  --schedule-expression "cron(0 21 * * ? *)"

aws events put-targets \
  --rule isolog-fetch-contents-daily \
  --targets "Id"="1","Arn"="arn:aws:lambda:ap-northeast-2:123456789:function:fetch-contents"
```

### 앱에서 DynamoDB 조회

```typescript
// services/contentService.ts (AWS SDK 사용)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function fetchCuratedContents(language: string, limit = 20) {
  const command = new QueryCommand({
    TableName: 'isolog-curated-contents',
    IndexName: 'language-createdAt-index',
    KeyConditionExpression: '#lang = :lang',
    ExpressionAttributeNames: { '#lang': 'language' },
    ExpressionAttributeValues: { ':lang': language },
    ScanIndexForward: false, // 최신순
    Limit: limit,
  });

  const { Items } = await docClient.send(command);
  return Items || [];
}
```

### 또는 API Gateway + Lambda로 REST API 구성

```
앱 → API Gateway → Lambda → DynamoDB
```

이 방식이 앱에서 직접 DynamoDB 호출보다 보안상 더 권장됨.

### AWS 구성 비용 분석

| 서비스 | 무료 한도 | 예상 사용량 | 비용 |
|--------|-----------|-------------|------|
| EventBridge | 무료 | 30회/월 | $0 |
| Lambda | 100만 호출 | 30회/월 | $0 |
| DynamoDB | 25GB, 2억 RW | ~1MB, 수천 RW | $0 |
| Google Search API | 100회/일 | ~10회/일 | $0 |
| **총합** | | | **$0** |

### Supabase vs AWS 최종 비교

| 항목 | Supabase 구성 | AWS 구성 |
|------|--------------|----------|
| **설정 난이도** | 쉬움 | 중간 |
| **관리 부담** | 낮음 | 낮음 |
| **확장성** | 좋음 | 최고 |
| **비용** | $0 | $0 |
| **DB 무료 기간** | 영구 | **영구** |
| **언어** | TypeScript/Deno | 다양 (Node, Python) |
| **추천 대상** | 빠른 MVP | AWS 경험자, 확장 고려 |

### AWS 콘솔 설정 진행 상황

**리전: us-east-1 (버지니아 북부)**

- [x] **Step 1**: DynamoDB 테이블 생성 (`isolog-curated-contents`)
  - [x] 테이블 생성 (PK, SK)
  - [x] GSI 추가 (`language-createdAt-index`)
  - [x] 로컬 연결 테스트 완료 (AWS CLI)
- [ ] **Step 2**: Lambda 함수 생성
- [ ] **Step 3**: EventBridge 스케줄 생성
- [x] **Step 4**: Google Custom Search API 키 생성
- [x] **Step 5**: 로컬 크롤링 테스트 완료
- [x] **Step 6**: 앱 정보탭 구현 완료

### 구현 완료 항목

#### 로컬 크롤링 스크립트
- `scripts/fetch-contents.ts` - Google Search API → DynamoDB 저장

#### 앱 정보탭
- `services/contentService.ts` - DynamoDB 조회 서비스
- `components/info/ContentCard.tsx` - 콘텐츠 카드 컴포넌트
- `app/(tabs)/info.tsx` - 정보탭 화면

#### 환경 설정
- `.env.local` - AWS 자격 증명 (개발용)
- `react-native-get-random-values` - crypto 폴리필

---

## 기술 스택

### 1. 스케줄러: GitHub Actions

**선택 이유**:
- 완전 무료 (public repo 무제한, private repo 월 2,000분)
- 설정 간단 (YAML 파일 하나)
- 별도 서버 불필요

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Vercel Cron | Vercel 통합 | 무료 티어 제한적 |
| Cloudflare Workers | 빠름 | 설정 복잡 |
| AWS EventBridge | 안정적 | AWS 종속 |

### 2. 서버: Supabase Edge Functions

**선택 이유**:
- Supabase DB와 동일 플랫폼 (통합 용이)
- Deno 기반 (TypeScript 네이티브)
- 무료 티어: 월 500,000 호출

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Vercel Functions | Next.js 친화적 | Cold start 있음 |
| Cloudflare Workers | 가장 빠름 | 러닝커브 |
| AWS Lambda | 검증됨 | 설정 복잡 |

### 3. 데이터베이스: Supabase (PostgreSQL)

**선택 이유**:
- 무료 티어: 500MB, 50,000 rows
- 실시간 구독 기능 (향후 활용 가능)
- REST API 자동 생성
- Row Level Security (RLS) 지원

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| Firebase Firestore | NoSQL, 간단 | 복잡한 쿼리 어려움 |
| PlanetScale | MySQL, 브랜칭 | 무료 티어 축소됨 |
| Neon | PostgreSQL, 서버리스 | 신생 서비스 |

### 4. 검색 API: Google Custom Search JSON API

**선택 이유**:
- 안정적이고 신뢰할 수 있는 결과
- 하루 100회 무료
- snippet(요약) 제공으로 AI 불필요

**제한사항**:
- 무료: 100 queries/day
- 유료: $5 per 1,000 queries

**대안**:
| 옵션 | 장점 | 단점 |
|------|------|------|
| SerpAPI | 더 풍부한 데이터 | 유료 ($50/월~) |
| Bing Search API | 가격 저렴 | 한국 결과 품질 낮음 |
| 직접 크롤링 | 무료 | 법적 리스크, 불안정 |

---

## 데이터베이스 스키마

```sql
-- 수집된 콘텐츠
CREATE TABLE curated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,              -- 중복 체크용
  title TEXT NOT NULL,
  snippet TEXT,                          -- Google 제공 요약
  source TEXT,                           -- 출처 사이트명
  thumbnail_url TEXT,                    -- 썸네일 (있으면)
  language TEXT DEFAULT 'ko',            -- 'ko' | 'en'
  search_keyword TEXT,                   -- 검색에 사용된 키워드
  is_approved BOOLEAN DEFAULT true,      -- 수동 필터링용
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_contents_language ON curated_contents(language);
CREATE INDEX idx_contents_created ON curated_contents(created_at DESC);
CREATE INDEX idx_contents_approved ON curated_contents(is_approved);

-- 검색 키워드 관리
CREATE TABLE search_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  language TEXT NOT NULL,                -- 'ko' | 'en'
  is_active BOOLEAN DEFAULT true,
  last_searched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 검색 키워드

### 한국어 (ko)
```
- 이소티논 후기
- 이소티논 부작용
- 로아큐탄 경험
- 여드름약 후기
- 이소트레티노인 효과
```

### 영어 (en)
```
- isotretinoin experience
- accutane journey
- roaccutane side effects
- isotretinoin tips
- accutane skincare routine
```

---

## 구현 단계

### Phase 1: MVP (1주)

1. **Supabase 프로젝트 설정**
   - 테이블 생성
   - RLS 정책 설정

2. **Edge Function 개발**
   - Google Custom Search API 호출
   - 중복 체크 후 DB 저장

3. **GitHub Actions 설정**
   - 매일 오전 6시 (KST) 실행
   - Edge Function 트리거

4. **앱 UI 개발**
   - 콘텐츠 목록 화면
   - 카드 컴포넌트
   - 외부 링크 열기

### Phase 2: 개선 (선택)

- [ ] 콘텐츠 좋아요/북마크 기능
- [ ] 카테고리 분류
- [ ] 푸시 알림 (새 콘텐츠)
- [ ] AI 요약 (비용 여유 시)

---

## 비용 분석

### 무료 티어로 운영 시

| 서비스 | 무료 한도 | 예상 사용량 | 비용 |
|--------|-----------|-------------|------|
| GitHub Actions | 2,000분/월 | ~30분/월 | $0 |
| Supabase DB | 500MB | ~10MB | $0 |
| Supabase Functions | 500K 호출 | ~30 호출 | $0 |
| Google Search API | 100회/일 | ~10회/일 | $0 |
| **총합** | | | **$0** |

### 스케일업 시 (월 1,000회 검색)

| 서비스 | 비용 |
|--------|------|
| Google Search API | ~$5 |
| Supabase Pro (선택) | $25 |

---

## 법적 고려사항

### 허용
- Google 검색 결과 snippet 표시
- 원본 링크로 연결
- 출처 명시

### 주의
- 본문 전체 크롤링/복사 금지
- 이미지 무단 사용 주의
- robots.txt 준수

### 권장
- 앱 내 "외부 콘텐츠" 명시
- 문제 시 즉시 삭제 가능한 구조

---

## 코드 예시

### Edge Function (Supabase)

```typescript
// supabase/functions/fetch-contents/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
const GOOGLE_CX = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

  // 활성 키워드 조회
  const { data: keywords } = await supabase
    .from('search_keywords')
    .select('*')
    .eq('is_active', true)

  const results = []

  for (const { keyword, language } of keywords || []) {
    // Google Custom Search API 호출
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(keyword)}&num=5`

    const response = await fetch(searchUrl)
    const data = await response.json()

    for (const item of data.items || []) {
      // 중복 체크 및 저장
      const { error } = await supabase
        .from('curated_contents')
        .upsert({
          url: item.link,
          title: item.title,
          snippet: item.snippet,
          source: item.displayLink,
          thumbnail_url: item.pagemap?.cse_thumbnail?.[0]?.src,
          language,
          search_keyword: keyword,
        }, { onConflict: 'url', ignoreDuplicates: true })

      if (!error) results.push(item.link)
    }
  }

  return new Response(JSON.stringify({ inserted: results.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### GitHub Actions

```yaml
# .github/workflows/fetch-contents.yml
name: Fetch Curated Contents

on:
  schedule:
    - cron: '0 21 * * *'  # 매일 UTC 21:00 (KST 06:00)
  workflow_dispatch:  # 수동 실행 가능

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_FUNCTION_URL }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

---

## 앱 연동

### API 호출

```typescript
// services/contentService.ts
import { supabase } from '@/lib/supabase'

export async function fetchCuratedContents(language: string, limit = 20) {
  const { data, error } = await supabase
    .from('curated_contents')
    .select('*')
    .eq('language', language)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
```

### UI 컴포넌트

```typescript
// components/community/ContentCard.tsx
interface ContentCardProps {
  title: string
  snippet: string
  source: string
  url: string
  thumbnailUrl?: string
}

export function ContentCard({ title, snippet, source, url, thumbnailUrl }: ContentCardProps) {
  const handlePress = () => {
    Linking.openURL(url)
  }

  return (
    <Pressable onPress={handlePress} className="bg-white rounded-xl p-4 mb-3">
      {thumbnailUrl && (
        <Image source={{ uri: thumbnailUrl }} className="w-full h-32 rounded-lg mb-3" />
      )}
      <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
      <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>{snippet}</Text>
      <Text className="text-xs text-gray-400">{source}</Text>
    </Pressable>
  )
}
```

---

## 향후 발전 방향

1. **AI 요약 추가**: OpenAI API로 snippet 개선
2. **개인화**: 사용자 관심사 기반 추천
3. **커뮤니티 전환**: 직접 글 작성 기능 추가
4. **콘텐츠 제보**: 사용자가 좋은 글 제보
