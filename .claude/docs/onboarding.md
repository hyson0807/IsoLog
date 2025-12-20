# Onboarding Feature

앱 첫 실행 시 복용 주기 설정을 유도하는 온보딩 바텀시트입니다.

## 트리거 조건

- 새 사용자: `@isoLog/onboarding_completed` 없음 + `@isoLog/medication_data` 없음
- 기존 사용자 (업데이트): medication_data가 있으면 자동으로 온보딩 완료 처리

## 기본값

- 첫 설치 시 `frequency: 'none'` (복용 주기 미설정 상태)
- 모든 날이 휴약일로 표시됨

## UI 구성 (`OnboardingBottomSheet`)

- 환영 메시지 + 앱 소개
- 복용 주기 선택 (가로 스크롤 카드)
- 시작일 선택 (격일/3일/주1회 선택 시)
- "시작하기" / "나중에 설정" 버튼

## 동작 흐름

```
앱 시작 -> useOnboarding 훅 실행
              |
   @isoLog/onboarding_completed 확인
              |
   'true' -> 온보딩 표시 안 함
              |
   @isoLog/medication_data 확인
   |- 데이터 있음 -> 기존 사용자 -> 자동 완료 처리
   +- 데이터 없음 -> 새 사용자 -> 온보딩 표시
              |
   주기 선택 + "시작하기" -> updateFrequency() + completeOnboarding()
   "나중에 설정" -> skipOnboarding() (frequency: 'none' 유지)
```

---

## 관련 파일

- `hooks/useOnboarding.ts` - 온보딩 상태 관리 훅
- `components/onboarding/OnboardingBottomSheet.tsx` - 온보딩 UI 컴포넌트
- `app/(tabs)/index.tsx` - 온보딩 바텀시트 통합

## 저장 키

- `@isoLog/onboarding_completed`