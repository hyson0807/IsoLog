# IsoCare 프리미엄 기능 구현 계획서

## 개요
- **목표**: 로그인 없이 기기 중심으로 유료 기능 제공, 나중에 선택적 로그인/동기화
- **유료 기능**: 광고 제거 + 알림 기능 (일회성 결제로 영구 사용)

---

## Phase 1: 기본 인프라 구축

### 1.1 익명 ID 시스템 구현
- [ ] UUID 생성 및 AsyncStorage 저장 로직
- [ ] 앱 시작 시 UUID 확인/생성 훅 구현
- [ ] `isPremium` 상태 관리 추가

### 1.2 프리미엄 Context 생성
- [ ] `PremiumContext.tsx` 생성
- [ ] 상태: `isPremium`, `anonymousId`, `isLoading`
- [ ] 함수: `checkPremiumStatus()`, `setPremiumStatus()`

**예상 파일**:
- `contexts/PremiumContext.tsx`
- `utils/deviceId.ts`

---

## Phase 2: 로컬 알림 시스템 구현

### 2.1 expo-notifications 설정
- [ ] `expo-notifications` 패키지 설치
- [ ] iOS/Android 권한 설정 (app.json)
- [ ] 알림 권한 요청 로직

### 2.2 알림 스케줄링 로직
- [ ] 매일 자정/앱 실행 시 알림 예약 확인
- [ ] 복용일 + 프리미엄 유저 → 밤 10시 알림 예약
- [ ] 복용 체크 시 → 해당 날짜 알림 취소
- [ ] 복용 체크 해제 시 → 다시 알림 예약

### 2.3 알림 서비스 구현
- [ ] `services/notificationService.ts` 생성
- [ ] `scheduleReminder(date)` - 알림 예약
- [ ] `cancelReminder(date)` - 알림 취소
- [ ] `checkAndScheduleToday()` - 오늘 알림 체크

**예상 파일**:
- `services/notificationService.ts`
- `hooks/useNotificationPermission.ts`

---

## Phase 3: 설정 페이지 UI 구현

### 3.1 알림 설정 섹션
- [ ] 알림 토글 버튼 (잠금 상태 디자인)
- [ ] 프리미엄 미가입 시 → 탭하면 결제 유도 모달
- [ ] 프리미엄 가입 시 → 토글 활성화

### 3.2 프리미엄 섹션
- [ ] 프리미엄 가입 버튼 (미가입 시)
- [ ] 프리미엄 상태 표시 (가입 시)
- [ ] 구매 복원 버튼

### 3.3 계정 섹션 (Phase 5 준비)
- [ ] 로그인/동기화 버튼 (추후 구현)
- [ ] 현재는 "Coming Soon" 표시

**예상 파일**:
- `app/settings.tsx` 수정
- `components/settings/NotificationToggle.tsx`
- `components/settings/PremiumSection.tsx`
- `components/common/PaywallModal.tsx`

---

## Phase 4: 인앱 결제 (RevenueCat) 구현

### 4.1 RevenueCat 설정
- [ ] `react-native-purchases` 패키지 설치
- [ ] RevenueCat 대시보드 설정 (App Store Connect, Google Play Console 연동)
- [ ] 상품 등록 (일회성 결제 상품)

### 4.2 결제 로직 구현
- [ ] RevenueCat SDK 초기화 (익명 ID 사용)
- [ ] 결제 플로우 구현
- [ ] 결제 성공 시 → `isPremium = true` 저장
- [ ] 구매 복원 기능

### 4.3 광고 제거 로직
- [ ] `isPremium` 상태에 따라 AdBanner 표시/숨김
- [ ] 조건부 렌더링 적용

**예상 파일**:
- `services/purchaseService.ts`
- `components/common/AdBanner.tsx` 수정

---

## Phase 5: 로그인 및 데이터 동기화 (추후)

### 5.1 소셜 로그인
- [ ] Google/Apple 로그인 구현
- [ ] Firebase Auth 또는 Supabase Auth

### 5.2 데이터 동기화
- [ ] 로컬 데이터 → 클라우드 업로드
- [ ] RevenueCat 익명 ID → 유저 ID 병합
- [ ] 클라우드 ↔ 로컬 동기화 로직

---

## 구현 순서 (권장)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
   ↓          ↓          ↓          ↓          ↓
 기반구축   알림구현   UI구현    결제연동   동기화
 (1일)     (2일)     (1일)     (2-3일)    (추후)
```

---

## 현재 진행 상태

- [x] Google AdMob 배너 광고 추가 완료
- [x] **Phase 1 완료**: 익명 ID 시스템 + PremiumContext
- [x] **Phase 2 완료**: 로컬 알림 시스템 (expo-notifications)
- [x] **Phase 3 완료**: 설정 페이지 UI (알림 토글, 프리미엄 섹션, Paywall 모달)
- [ ] **Phase 4 시작 예정**: RevenueCat 인앱 결제 연동

---

## 기술 스택 추가 예정

| 기능 | 패키지 |
|------|--------|
| 로컬 알림 | `expo-notifications` |
| 인앱 결제 | `react-native-purchases` (RevenueCat) |
| UUID 생성 | `expo-crypto` 또는 `uuid` |

---

## 참고 사항

1. **Development Build 필수**: 알림, 인앱 결제 모두 네이티브 코드 필요
2. **테스트**: 결제는 샌드박스 환경에서 테스트
3. **앱스토어 심사**: 인앱 결제 포함 시 심사 기준 준수 필요