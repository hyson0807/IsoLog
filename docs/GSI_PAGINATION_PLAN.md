# GSI 기반 페이지네이션 구현 계획

## 배경

### 현재 문제
```
DynamoDB Query (Limit=40) → 전체 글 40개 → Filter(isVerified=true) → 결과 0~40개
```
- 크롤링된 미승인 글이 많으면 승인된 글이 안 보임
- Filter는 Limit 적용 **후**에 실행되기 때문

### 해결 방안
GSI(Global Secondary Index)를 추가하여 승인된 글만 별도로 인덱싱

```
GSI Query (Limit=20) → 승인된 글 20개 → 정확히 20개 반환
```

---

## 구현 계획

### 1단계: AWS 콘솔에서 GSI 생성

**테이블**: `isolog-curated-contents`

**새 GSI 설정**:
| 항목 | 값 |
|------|-----|
| Index name | `verifiedLanguage-publishDate-index` |
| Partition key | `verifiedLanguage` (String) |
| Sort key | `publishDate` (String) |
| Projected attributes | All |

**GSI 필드 규칙**:
- `verifiedLanguage`: `"VERIFIED#{language}"` (예: `"VERIFIED#ko"`, `"VERIFIED#en"`)
- `publishDate`: `publishedAt || createdAt` (ISO 8601 형식)
  - 원본 글 발행일(`publishedAt`)을 우선 사용
  - `publishedAt`이 없으면 크롤링 날짜(`createdAt`) 사용
  - 이렇게 해야 앱에서 "실제 최신 글"이 위에 표시됨
- 승인된 글(`isVerified=true`)만 이 필드를 가짐 → Sparse Index

**왜 publishedAt을 우선 사용하는가?**
- `createdAt`: 크롤링한 날짜 (DB에 저장된 시점)
- `publishedAt`: 원본 글이 작성된 날짜 (실제 발행일)
- 예: 2023년에 작성된 글을 2024년에 크롤링하면
  - `createdAt` = 2024년 (크롤링 시점)
  - `publishedAt` = 2023년 (실제 작성일)
  - 사용자에게는 `publishedAt` 기준이 더 자연스러움

**AWS 콘솔 경로**:
1. DynamoDB 콘솔 접속
2. 테이블 `isolog-curated-contents` 선택
3. Indexes 탭 → Create index
4. 위 설정 입력 후 Create

---

### 2단계: 기존 데이터 마이그레이션

기존에 `isVerified=true`인 아이템에 GSI 필드 추가하는 스크립트 실행

**스크립트**: `scripts/migrate-to-verified-gsi.ts`

```typescript
// 의사코드
1. 테이블 스캔 (isVerified=true인 아이템)
2. 각 아이템에 verifiedLanguage, publishDate 추가
   - verifiedLanguage = "VERIFIED#" + language
   - publishDate = publishedAt || createdAt  // publishedAt 우선, 없으면 createdAt
```

---

### 3단계: 관리자 페이지 수정

관리자가 글을 승인할 때 GSI 필드도 함께 추가되도록 수정

**승인 시 업데이트할 필드**:
```javascript
{
  "isVerified": true,
  "verifiedLanguage": "VERIFIED#" + language,
  "publishDate": publishedAt || createdAt  // publishedAt 우선
}
```

**승인 취소 시**:
```javascript
{
  "isVerified": false,
  "verifiedLanguage": null,  // 또는 REMOVE
  "publishDate": null        // 또는 REMOVE
}
```

---

### 4단계: contentService.ts 수정

**현재 코드**:
```typescript
const command = new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: "language-createdAt-index",
  KeyConditionExpression: "#lang = :lang",
  FilterExpression: "isVerified = :true AND ...",
  Limit: limit * 2,
});
```

**변경 후**:
```typescript
const command = new QueryCommand({
  TableName: TABLE_NAME,
  IndexName: "verifiedLanguage-publishDate-index",
  KeyConditionExpression: "verifiedLanguage = :vl",
  ExpressionAttributeValues: {
    ":vl": `VERIFIED#${language}`,
  },
  ScanIndexForward: false, // 최신순 (publishDate 기준)
  Limit: limit,
  ExclusiveStartKey: lastEvaluatedKey, // 페이지네이션용
});

// 참고: publishDate가 이미 publishedAt 기준이므로
// 프론트에서 별도 정렬 불필요 (기존 .sort() 제거 가능)
```

**반환 타입 변경**:
```typescript
interface FetchResult {
  items: CuratedContent[];
  lastKey: Record<string, any> | null; // 다음 페이지 키
}
```

---

### 5단계: 앱 UI 무한 스크롤 구현

**info.tsx 수정**:

```typescript
const [contents, setContents] = useState<CuratedContent[]>([]);
const [lastKey, setLastKey] = useState<any>(null);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [hasMore, setHasMore] = useState(true);

// 초기 로드
const loadInitial = async () => {
  const result = await fetchContentsByTab(language, tabType, 20);
  setContents(result.items);
  setLastKey(result.lastKey);
  setHasMore(!!result.lastKey);
};

// 추가 로드 (스크롤 끝에 도달 시)
const loadMore = async () => {
  if (!hasMore || isLoadingMore) return;

  setIsLoadingMore(true);
  const result = await fetchContentsByTab(language, tabType, 20, lastKey);
  setContents(prev => [...prev, ...result.items]);
  setLastKey(result.lastKey);
  setHasMore(!!result.lastKey);
  setIsLoadingMore(false);
};

// FlatList onEndReached
<FlatList
  data={contents}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
/>
```

---

## 파일 수정 목록

| 파일 | 수정 내용 |
|------|----------|
| `services/contentService.ts` | GSI 쿼리, 페이지네이션 지원 |
| `app/(tabs)/info.tsx` | 무한 스크롤 UI |
| `scripts/migrate-to-verified-gsi.ts` | 기존 데이터 마이그레이션 (새로 생성) |
| `scripts/fetch-contents.ts` | GSI 필드 추가 로직 (크롤링 시 불필요, 관리자 승인 시 추가) |
| `scripts/fetch-naver-contents.ts` | 동일 |
| `scripts/fetch-contents-archive.ts` | 동일 |

---

## 테스트 체크리스트

- [ ] GSI 생성 완료 확인 (AWS 콘솔에서 Status: Active)
- [ ] 마이그레이션 스크립트 실행 후 기존 verified 글에 GSI 필드 추가됨
- [ ] 앱에서 승인된 글 정상 표시
- [ ] 무한 스크롤 동작 확인 (20개 → 스크롤 → 20개 추가)
- [ ] 관리자 페이지에서 승인/취소 시 GSI 필드 정상 업데이트

---

## 롤백 계획

문제 발생 시:
1. `contentService.ts`를 이전 버전으로 되돌림 (기존 GSI 사용)
2. 새 GSI는 삭제하지 않아도 됨 (비용 발생하지만 영향 없음)

---

## 예상 소요 시간

| 단계 | 예상 시간 |
|------|----------|
| GSI 생성 | 5~10분 (AWS 처리) |
| 마이그레이션 스크립트 | 작성 + 실행 |
| contentService 수정 | - |
| 앱 UI 수정 | - |
| 테스트 | - |

---

## 참고: DynamoDB 페이지네이션 원리

```
첫 번째 요청:
  Query(Limit=20) → 20개 반환 + LastEvaluatedKey: {PK: "...", SK: "..."}

두 번째 요청:
  Query(Limit=20, ExclusiveStartKey: 이전 LastEvaluatedKey) → 다음 20개 반환

마지막 요청:
  Query(Limit=20) → N개 반환 + LastEvaluatedKey: undefined (더 이상 없음)
```