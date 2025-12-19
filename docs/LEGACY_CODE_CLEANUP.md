# 레거시 코드 제거 가이드

## 배경
v1.0.4에서 OTA 업데이트 race condition 버그를 해결하기 위해 구버전 기본 데이터 감지 로직을 추가했습니다.
이 코드는 앱스토어에 신버전 빌드가 배포된 후 일정 기간이 지나면 제거해도 됩니다.

## 제거 대상 코드

### 1. `contexts/MedicationContext.tsx`

`loadData` 함수 내 `isLegacyDefaultData` 관련 코드:

```typescript
// 구버전이 저장한 기본 데이터인지 확인 (OTA race condition 대응)
// 구버전 기본값: frequency='every2days', 나머지 모두 비어있음
const isLegacyDefaultData =
  data.schedule.frequency === 'every2days' &&
  data.takenDates.length === 0 &&
  data.firstTakenDate === null &&
  (!data.drinkingDates || data.drinkingDates.length === 0) &&
  (!data.skinRecords || data.skinRecords.length === 0);

if (isLegacyDefaultData) {
  // 구버전 기본 데이터 삭제 → 신규 사용자로 처리
  await AsyncStorage.removeItem(STORAGE_KEY);
  // state 업데이트 안 함 (기본값 유지: frequency: 'none')
} else {
  // ... 기존 로직
}
```

### 2. `hooks/useOnboarding.ts`

`checkOnboarding` 함수 내 `isLegacyDefaultData` 관련 코드:

```typescript
// 구버전이 저장한 기본 데이터인지 확인 (OTA race condition 대응)
const isLegacyDefaultData =
  data.schedule?.frequency === 'every2days' &&
  (!data.takenDates || data.takenDates.length === 0) &&
  data.firstTakenDate === null &&
  (!data.drinkingDates || data.drinkingDates.length === 0) &&
  (!data.skinRecords || data.skinRecords.length === 0);

if (isLegacyDefaultData) {
  // 구버전 기본 데이터 -> 새 사용자로 처리
  setShouldShowOnboarding(true);
} else {
  // ... 기존 로직
}
```

## 제거 조건

다음 조건을 **모두** 만족할 때 제거:

1. **신버전 앱스토어 배포 완료**: `frequency: 'none'`이 기본값인 빌드가 앱스토어에 배포됨
2. **충분한 시간 경과**: 배포 후 최소 2-3개월 (대부분의 사용자가 업데이트 완료)
3. **강제 업데이트 적용 (선택)**: 구버전 사용자가 거의 없음을 확인

## 제거 방법

### MedicationContext.tsx

```typescript
// 변경 전
if (stored) {
  const data = JSON.parse(stored);
  const isLegacyDefaultData = ...;
  if (isLegacyDefaultData) {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } else {
    setSchedule(data.schedule);
    // ...
  }
}

// 변경 후
if (stored) {
  const data = JSON.parse(stored);
  setSchedule(data.schedule);
  setTakenDates(new Set(data.takenDates));
  setFirstTakenDate(data.firstTakenDate);
  setDrinkingDates(new Set(data.drinkingDates || []));
  if (data.skinRecords) {
    // ...
  }
  setDataExists(true);
}
```

### useOnboarding.ts

```typescript
// 변경 전
if (existingData) {
  const data = JSON.parse(existingData);
  const isLegacyDefaultData = ...;
  if (isLegacyDefaultData) {
    setShouldShowOnboarding(true);
  } else {
    // ...
  }
}

// 변경 후
if (existingData) {
  const data = JSON.parse(existingData);
  const hasUsageHistory =
    (data.takenDates && data.takenDates.length > 0) ||
    (data.schedule && data.schedule.frequency !== 'none');

  if (hasUsageHistory) {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShouldShowOnboarding(false);
  } else {
    setShouldShowOnboarding(true);
  }
}
```

## 관련 커밋

- `916f5aa` - fix: 구버전 기본 데이터 감지 및 삭제 로직 추가
- `a32bb22` - fix: useOnboarding에도 구버전 기본 데이터 감지 추가

## 참고

이 코드는 성능에 거의 영향을 주지 않습니다 (앱 시작 시 1회, 단순 boolean 비교).
급하게 제거할 필요는 없으며, 다음 메이저 버전 업데이트 시 정리하면 됩니다.
