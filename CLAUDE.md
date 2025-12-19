# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IsoLog**는 이소티논(Isotretinoin) 복용자를 위한 글로벌 복용 관리 앱입니다.

### 핵심 기능
- **복용 체크**: 매일 앱에서 복용 여부를 체크하고 기록
- **피부 상태 기록**: 트러블/건조함 상태 기록 (복용 여부 무관), 메모는 미래 날짜도 작성 가능
- **복용 주기 설정**: 복용 안함/매일/격일/3일/주1회 등 다양한 복용 주기 + 시작일 설정 지원 (캘린더 탭에서 설정)
- **캘린더**: 월별 복용 기록 조회, 과거 기록 수정, 미래 복용 예정일 표시
- **술 약속 경고**: 음주 예정일 D±4일 경고 표시, 복용 시 확인 팝업
- **데이터 영속성**: AsyncStorage로 앱 재시작 후에도 기록 유지
- **글로벌 지원**: 기기의 locale에 따라 날짜 형식 자동 변환

### 프리미엄 기능 (구현 완료)
- **복용 알림**: 복용일 지정 시간에 로컬 알림 (프리미엄 전용)
- **알림 시간 설정**: 바텀시트 타임피커로 원하는 시간 설정 (기본값 오후 10시)
- **광고 제거**: 프리미엄 유저는 AdMob 배너 미표시
- **익명 ID 시스템**: 로그인 없이 기기 중심 결제 관리
- **인앱 결제**: RevenueCat 연동 (평생 이용권 $9.99)

### 다국어 지원 (구현 완료)
- **지원 언어**: 한국어 (ko), 영어 (en)
- **기본 언어**: 영어 (fallback)
- **언어 감지**: 기기 설정 언어 자동 감지 → AsyncStorage 저장
- **설정에서 변경**: 설정 > 언어에서 수동 변경 가능

### 예정 기능
- **로그인/동기화**: 소셜 로그인 + 클라우드 데이터 동기화
- **커뮤니티**: 사용자 간 정보 공유

## Development Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server
npm run ios          # Start iOS simulator
npm run android      # Start Android emulator
npm run web          # Start web browser
npm run lint         # Run ESLint
```

## Architecture

- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: File-based routing using `expo-router`
- **Styling**: NativeWind (TailwindCSS for React Native)
- **State Management**: React Context API (`MedicationContext`, `PremiumContext`)
- **Storage**: AsyncStorage for data persistence
- **Notifications**: `expo-notifications` for local push notifications
- **Time Picker**: `@react-native-community/datetimepicker` for notification time setting
- **Crypto**: `expo-crypto` for UUID generation
- **Localization**: `expo-localization` for device locale detection
- **i18n**: `i18next` + `react-i18next` for multi-language support
- **Ads**: `react-native-google-mobile-ads` for AdMob (배너 + 전면 광고)
- **IAP**: `react-native-purchases` for RevenueCat in-app purchases
- **Store Review**: `expo-store-review` for native app store review prompts
- **OTA Updates**: `expo-updates` for over-the-air updates via EAS Update
- **Clipboard**: `expo-clipboard` for copy to clipboard functionality
- **Path Aliases**: `@/*` maps to project root

### Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home screen (medication check)
│   ├── calendar.tsx     # Calendar screen (monthly view)
│   └── tracking.tsx     # Tracking screen (피부상태, 복용통계)
├── _layout.tsx          # Root layout with Provider 설정 + i18n import
├── settings.tsx         # 설정 페이지 (프리미엄, 알림, 언어, 계정, 문의)
├── paywall.tsx          # 프리미엄 구매 페이지
├── subscription.tsx     # 구독 관리 페이지
└── global.css           # Tailwind CSS imports

components/
├── common/              # Shared components
│   ├── Header.tsx                    # 날짜 표시 + 메뉴 버튼
│   ├── DrawerMenu.tsx                # 사이드 드로어 메뉴
│   ├── WarningConfirmModal.tsx       # 경고 확인 팝업
│   ├── AdBanner.tsx                  # Google AdMob 배너 광고
│   ├── NotificationPromptSnackbar.tsx # 알림 유도 스낵바
│   └── UpdateLoadingScreen.tsx       # OTA 업데이트 로딩 화면
├── home/                # Home screen components
│   ├── StatusCard.tsx           # 상태 + 경고 메시지
│   ├── MedicationCheckCard.tsx  # 복용 체크 카드 (직사각형)
│   ├── MedicationButton.tsx     # 복용 버튼 (원형, legacy)
│   ├── SkinRecordCard.tsx       # 피부 상태 기록 카드
│   └── DailyTipCard.tsx         # 이소티논 케어 팁 카드
├── calendar/            # Calendar components
│   ├── CalendarHeader.tsx    # Month navigation + 범례 팝오버
│   ├── WeekdayRow.tsx        # Weekday labels
│   ├── CalendarGrid.tsx      # Date grid (6x7)
│   ├── DayCell.tsx           # Individual day cell + 체크/밑줄/메모 표시
│   ├── DayDetailSheet.tsx    # 복용/술약속/피부기록 토글 시트
│   ├── MonthlySummary.tsx    # Monthly taken count
│   ├── FrequencySettingButton.tsx  # 복용 주기 설정 버튼
│   └── FrequencyBottomSheet.tsx    # 복용 주기 + 시작일 설정 바텀시트
├── settings/            # Settings components
│   ├── PremiumSection.tsx           # 프리미엄 배너 + 혜택 목록
│   ├── NotificationToggle.tsx       # 알림 설정 토글 + 시간 표시
│   ├── NotificationTimeBottomSheet.tsx # 알림 시간 선택 바텀시트
│   └── LanguageBottomSheet.tsx      # 언어 선택 바텀시트
├── onboarding/          # Onboarding components
│   └── OnboardingBottomSheet.tsx    # 첫 실행 시 복용 주기 설정 유도
└── tracking/            # Tracking screen components (TBD)

contexts/                # React Context providers
├── MedicationContext.tsx    # Global state + AsyncStorage + today 자동 갱신
└── PremiumContext.tsx       # Premium/알림 상태 관리

services/                # Business logic services
└── notificationService.ts   # 로컬 알림 예약/취소

hooks/                   # Custom React hooks
├── useMedicationReminder.ts    # 복용 알림 관리
├── useNotificationPermission.ts # 알림 권한 관리
├── useInterstitialAd.ts        # 전면 광고 관리
├── useAppUpdates.ts            # OTA 업데이트 확인/적용
├── useTodayDate.ts             # 자정 날짜 변경 시 자동 갱신
├── useIsAfter21.ts             # 21시 이후 여부 실시간 체크
└── useOnboarding.ts            # 첫 실행 온보딩 상태 관리

constants/               # App constants
├── theme.ts             # Colors, spacing, fonts
├── frequency.ts         # Medication frequency options
├── skin.ts              # 피부 상태 옵션 (트러블/건조함)
├── revenuecat.ts        # RevenueCat API keys, entitlements
└── admob.ts             # AdMob 플랫폼별 Ad Unit ID

types/                   # TypeScript type definitions
└── medication.ts        # FrequencyType, DayCellStatus, SkinRecord, etc.

utils/                   # Utility functions
├── dateUtils.ts         # Date formatting, calendar helpers
├── deviceId.ts          # 익명 기기 ID 생성/관리
└── reviewService.ts     # 앱스토어 리뷰 요청

locales/                 # i18n 번역 파일
├── ko.json              # 한국어 번역
├── en.json              # 영어 번역
└── index.ts             # i18n 설정 (언어 감지, AsyncStorage 저장)
```

### Key Configurations

- **New Architecture**: Enabled
- **React Compiler**: Enabled
- **Typed Routes**: Enabled
- **TypeScript**: Strict mode
- **Tab Navigation**: `initialRouteName="index"` (홈이 기본 화면, 탭 순서: 캘린더 | 홈 | 트래킹)

### Calendar Feature

캘린더는 날짜 상태를 시각화합니다:

| 상태 | 시점 | 스타일 |
|------|------|--------|
| `taken` | 과거/오늘 | 우측상단 초록색 체크 아이콘 ✓ |
| `missed` | 과거 | 회색 텍스트 |
| `scheduled` | 미래 | 연한 주황색 배경 |
| `rest` | 미래 | 빈 배경 |
| `today` | 오늘(미복용) | 주황색 테두리 |
| `disabled` | 첫 복용일 이전 | 회색 비활성 |
| `drinking_*` | 술 약속 D±4일 | 날짜 아래 빨간색 밑줄 (그라데이션) |

**오늘 + 음주경고 동시 표시**: 오늘이 음주 예정일 D±4일 범위에 있으면 주황색 테두리와 빨간색 밑줄이 동시에 표시됨

**범례 팝오버**: 헤더 우측 ⓘ 버튼 클릭 시 캘린더 안내 표시

**데이터 흐름**: `MedicationContext` → 홈/캘린더 양방향 동기화
**영속성**: AsyncStorage (`@isoLog/medication_data`)

### 자정 날짜 변경 자동 갱신

`useTodayDate` 훅을 통해 자정(00:00)에 날짜가 바뀌면 UI가 실시간으로 갱신됩니다.

**동작 방식**:
- 자정까지 남은 시간 계산 후 `setTimeout` 설정
- `AppState` 리스너로 백그라운드 → 포그라운드 전환 시 날짜 확인
- `MedicationContext`에서 `today`를 state로 관리하여 전체 UI 자동 갱신

**영향 범위**:
- 홈 화면: 오늘 복용 상태, 피부 기록
- 캘린더: 오늘 날짜 하이라이트
- 헤더: 날짜 표시

### Drinking Warning Feature

술 약속 경고 시스템은 음주 전후 간 건강을 위해 휴약을 권장합니다.

**경고 레벨 (D±4일)** - 날짜 아래 밑줄로 표시:

| 레벨 | 거리 | 밑줄 색상 |
|------|------|----------|
| `dday` | 당일 | `bg-red-600` (진한 빨강) |
| `day1` | D±1 | `bg-red-500` |
| `day2` | D±2 | `bg-red-400` |
| `day3` | D±3 | `bg-red-300` |
| `day4` | D±4 | `bg-red-200` (연한 빨강) |

**기능**:
- 캘린더에서 미래 날짜 클릭 → 술 약속 추가/삭제
- 경고 기간 날짜는 숫자 아래 빨간색 밑줄로 표시 (그라데이션)
- 술 약속 당일은 우측상단 🍷 아이콘 표시
- 홈 화면 버튼/상태카드도 경고 색상 동기화
- 경고 기간 복용 시 확인 팝업 (Double Check)

### AdMob Integration

Google AdMob 광고가 앱에 통합되어 있습니다.

**App ID** (app.json 설정):
- iOS: `ca-app-pub-2320452683835335~1158955767`
- Android: `ca-app-pub-2320452683835335~1386186473`

**Ad Unit ID** (`constants/admob.ts`에서 관리):

| 광고 타입 | iOS | Android |
|----------|-----|---------|
| 배너 | `ca-app-pub-2320452683835335/2836845429` | `ca-app-pub-2320452683835335/1979167126` |
| 전면 | `ca-app-pub-2320452683835335/9737597014` | `ca-app-pub-2320452683835335/1240159899` |

**광고 위치**:
- **배너 광고**: 캘린더 탭 상단 (`AdBanner` 컴포넌트)
- **전면 광고**: 피부 기록 완료 후에만 (`useInterstitialAd` 훅)

**특징**:
- 개발 환경: 테스트 광고 자동 사용 (`TestIds`)
- 프리미엄 유저: 모든 광고 비표시
- 웹 플랫폼: 광고 미지원

**빌드 요구사항**:
- 네이티브 코드 포함으로 **Expo Go 미지원**
- Development Build 필요: `npx expo prebuild && npx expo run:ios`

### Home Screen UI 로직

홈 화면은 복용일 여부와 21시 기준으로 다른 UI를 표시합니다. `useIsAfter21` 훅으로 실시간 갱신됩니다.

**복용일**:
| 시간 | 상태 | 표시 컴포넌트 |
|------|------|---------------|
| 21시 전 | 미복용 | `MedicationCheckCard` + `DailyTipCard` |
| 21시 전 | 복용완료 | `DailyTipCard` |
| 21시 이후 | 미복용 + 피부기록 미완료 | `MedicationCheckCard` + `SkinRecordCard` |
| 21시 이후 | 미복용 + 피부기록 완료 | `MedicationCheckCard` + `DailyTipCard` |
| 21시 이후 | 복용완료 + 피부기록 미완료 | `SkinRecordCard` |
| 21시 이후 | 복용완료 + 피부기록 완료 | `DailyTipCard` |

**휴약일**:
| 시간 | 상태 | 표시 컴포넌트 |
|------|------|---------------|
| 21시 전 | - | `DailyTipCard` |
| 21시 이후 | 피부기록 미완료 | `SkinRecordCard` |
| 21시 이후 | 피부기록 완료 | `DailyTipCard` |

**MedicationCheckCard**: 직사각형 카드 스타일의 복용 체크 UI. 체크하면 사라짐. 경고 기간(D±4일)에는 빨간색 테두리/배경 표시.

**실시간 갱신**:
- 자정(00:00): 날짜 변경 시 UI 자동 갱신 (`useTodayDate` 훅)
- 21시: 시간 도달 시 UI 자동 변경 (`useIsAfter21` 훅의 타이머 + AppState 리스너)

### Skin Record Feature

피부 상태를 기록하는 기능입니다.

**흐름**:
1. 홈 (21시 전): `MedicationCheckCard` 체크 → `DailyTipCard` 표시
2. 홈 (21시 이후): `MedicationCheckCard` 체크 → `SkinRecordCard` 표시 → 트러블 + 건조함 선택 → `DailyTipCard` 표시
3. 캘린더: 날짜 선택 → 피부 상태(과거/오늘만) + 메모(미래 포함) 기록 가능

**캘린더 DayDetailSheet 구조**:
- 피부 상태 (트러블/건조함): `canEdit`일 때만 편집 (과거/오늘)
- 메모: 모든 날짜에서 편집 가능 (미래 포함)

**트러블 상태** (`TroubleLevel`):
| 값 | 라벨 | 이모지 |
|-----|------|--------|
| `calm` | 잠잠해요 | ✨ |
| `few` | 몇 개 났어요 | 🥲 |
| `severe` | 심해졌어요 | 🚨 |

**건조함 정도** (`DrynessLevel`):
| 값 | 라벨 | 이모지 |
|-----|------|--------|
| `moist` | 촉촉해요 | 😌 |
| `normal` | 보통이에요 | 🙂 |
| `dry` | 건조해요 | 🌵 |

**데이터 구조** (`SkinRecord`):
```typescript
interface SkinRecord {
  date: string;           // YYYY-MM-DD
  trouble?: TroubleLevel;
  dryness?: DrynessLevel;
  memo?: string;          // 캘린더에서만 수정 가능
  recordedAt: string;     // ISO datetime
}
```

**DailyTipCard**: 날짜 기반으로 매일 다른 2개의 이소티논 케어 팁 제공 (물 마시기, 보습, 자외선 차단 등 8가지 로테이션)

### Frequency Setting Feature

복용 주기를 설정하는 기능입니다. **캘린더 탭 하단**에서 설정합니다.

**FrequencyType**:
| 타입 | 라벨 | 설명 |
|------|------|------|
| `none` | 복용 안함 | 복용 주기 미설정 (모든 날이 휴약일) |
| `daily` | 매일 복용 | 매일 1알 |
| `every2days` | 격일 복용 | 2일에 1알 |
| `every3days` | 3일에 1알 | 3일에 1알 |
| `weekly` | 주 1회 | 7일에 1알 |

**UI 구성** (`FrequencyBottomSheet`):
- 가로 스크롤 카드 형태로 주기 선택
- 선택된 카드 다시 클릭 시 → `none`(복용 안함)으로 해제
- `daily`/`none` 외 선택 시 → 시작일 설정 섹션 표시
- 시작일 변경 시 완료 버튼으로 확정

**시작일(referenceDate)**:
- 격일/3일/주1회 등 주기성 복용에서 기준점 역할
- 기본값: 오늘
- 과거/미래 날짜 모두 선택 가능
- 상대 텍스트 표시: (오늘), (내일), (어제)

**동작 방식**:
- 주기 선택 → 즉시 반영
- 시작일 변경 → 완료 버튼 클릭 시 반영
- `frequencyDays = 0` (none) → 모든 날이 복용일 아님, 캘린더 scheduled 표시 없음

### Onboarding Feature

앱 첫 실행 시 복용 주기 설정을 유도하는 온보딩 바텀시트입니다.

**트리거 조건**:
- 새 사용자: `@isoLog/onboarding_completed` 없음 + `@isoLog/medication_data` 없음
- 기존 사용자 (업데이트): medication_data가 있으면 자동으로 온보딩 완료 처리

**기본값**:
- 첫 설치 시 `frequency: 'none'` (복용 주기 미설정 상태)
- 모든 날이 휴약일로 표시됨

**UI 구성** (`OnboardingBottomSheet`):
- 환영 메시지 + 앱 소개
- 복용 주기 선택 (가로 스크롤 카드)
- 시작일 선택 (격일/3일/주1회 선택 시)
- "시작하기" / "나중에 설정" 버튼

**동작 흐름**:
```
앱 시작 → useOnboarding 훅 실행
              ↓
   @isoLog/onboarding_completed 확인
              ↓
   'true' → 온보딩 표시 안 함
              ↓
   @isoLog/medication_data 확인
   ├─ 데이터 있음 → 기존 사용자 → 자동 완료 처리
   └─ 데이터 없음 → 새 사용자 → 온보딩 표시
              ↓
   주기 선택 + "시작하기" → updateFrequency() + completeOnboarding()
   "나중에 설정" → skipOnboarding() (frequency: 'none' 유지)
```

**저장 키**: `@isoLog/onboarding_completed`

**주요 파일**:
- `hooks/useOnboarding.ts`: 온보딩 상태 관리 훅
- `components/onboarding/OnboardingBottomSheet.tsx`: 온보딩 UI 컴포넌트
- `app/(tabs)/index.tsx`: 온보딩 바텀시트 통합

### Store Review (앱스토어 리뷰 요청)

`expo-store-review`를 사용하여 복용 체크 완료 후 네이티브 리뷰 팝업을 표시합니다.

**트리거 타이밍**: 복용 체크 완료 1초 후

**트리거 조건** (특정 복용 횟수에만):
- 3회, 10회, 30회, 60회, 100회

**저장 키**: `@isoLog/medication_check_count`

**주요 파일**:
- `utils/reviewService.ts`: 리뷰 요청 로직 (`tryRequestReview`)
- `app/(tabs)/index.tsx`: `handleMedicationPress`, `handleWarningConfirm`에서 호출

**흐름**:
```
복용 버튼 클릭 → toggleMedication() → 1초 후 tryRequestReview()
                                              ↓
                              복용 횟수 확인 (3, 10, 30, 60, 100?)
                                              ↓
                              조건 충족 시 StoreReview.requestReview()
```

**주의사항**:
- iOS/Android 모두 OS가 연간 표시 횟수를 제한함 (호출해도 무시될 수 있음)
- 시뮬레이터에서 정확한 테스트 불가 (TestFlight/Internal Testing 필요)

### RevenueCat Integration

RevenueCat을 통한 인앱 결제 (평생 이용권)가 구현되어 있습니다.

**상품 정보**:
- Product ID: `isolog1`
- 가격: $9.99 (평생 이용권, Non-consumable)
- Entitlement: `IsoLog Pro`

**환경별 API Key** (`eas.json`에서 관리):

| 환경 | iOS | Android |
|------|-----|---------|
| Development/Preview | `test_xxx` | `test_xxx` |
| Production | `appl_xxx` | `goog_xxx` |

**환경변수**:
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`: iOS용 RevenueCat API Key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`: Android용 RevenueCat API Key

**주요 파일**:
- `constants/revenuecat.ts`: 플랫폼별 API Key 선택, Entitlement ID, Product ID
- `contexts/PremiumContext.tsx`: RevenueCat 초기화, 구매 상태 관리, CustomerInfo 리스너
- `app/paywall.tsx`: 구매 UI, 결제/복원 처리
- `app/subscription.tsx`: 구독 관리 페이지

**초기화 흐름**:
```
앱 시작 → Purchases.configure({ apiKey, appUserID: deviceId })
                    ↓
         addCustomerInfoUpdateListener() 등록
                    ↓
         getCustomerInfo() → entitlements.active['IsoLog Pro'] 확인
                    ↓
              isPremium 상태 업데이트
                    ↓
         광고 숨김 / 알림 기능 활성화
```

**구매 흐름** (Offering → Package → Product):
```
Purchases.getOfferings()
         ↓
  offerings.current (현재 Offering)
         ↓
  offering.availablePackages[0] (첫 번째 Package)
         ↓
  Purchases.purchasePackage(package)
         ↓
  customerInfo.entitlements.active['IsoLog Pro'] 확인
         ↓
  isPremium = true → 프리미엄 기능 활성화
```

**CustomerInfo 리스너**:
- 다른 기기에서 구매/환불 시 실시간 상태 업데이트
- 앱 포그라운드 복귀 시 자동 동기화

### i18n (다국어 지원)

`i18next` + `react-i18next`를 사용하여 한국어/영어 다국어 지원을 구현했습니다.

**언어 감지 우선순위**:
1. AsyncStorage에 저장된 사용자 선택 언어
2. 기기 설정 언어 (`expo-localization`)
3. 영어 (fallback)

**저장 키**: `@isoLog/language_preference`

**번역 키 구조**:
| prefix | 용도 |
|--------|------|
| `common` | 공통 버튼/텍스트 (취소, 확인, 저장 등) |
| `nav` | 네비게이션 라벨 |
| `home` | 홈 화면 상태 메시지 |
| `skin` | 피부 상태 옵션 |
| `tips` | 데일리 케어 팁 |
| `frequency` | 복용 주기 옵션 |
| `calendar` | 캘린더 UI |
| `dayDetail` | 날짜 상세 시트 |
| `premium` | 프리미엄 섹션 |
| `notification` | 알림 설정 |
| `settings` | 설정 페이지 |
| `paywall` | 결제 페이지 |
| `subscription` | 구독 관리 |
| `modal` | 모달/팝업 |
| `alert` | Alert 메시지 |
| `snackbar` | 스낵바 메시지 |
| `tracking` | 트래킹 화면 |
| `update` | OTA 업데이트 메시지 |
| `onboarding` | 온보딩 화면 |

**사용 방법**:
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('home.medicationDay')}</Text>;
}
```

**언어 변경**:
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
await i18n.changeLanguage('en'); // 자동으로 AsyncStorage에 저장됨
```

**주요 파일**:
- `locales/index.ts`: i18n 초기화 + 언어 감지 로직
- `locales/ko.json`: 한국어 번역
- `locales/en.json`: 영어 번역
- `components/settings/LanguageBottomSheet.tsx`: 언어 선택 UI

### OTA Updates (EAS Update)

`expo-updates`를 사용하여 앱스토어 재배포 없이 JS 코드를 업데이트합니다.

**설정** (`app.json`):
```json
{
  "runtimeVersion": { "policy": "appVersion" },
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_LOAD",
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/2d8d2553-b672-48e3-91d1-597c1307fbcc"
  }
}
```

**채널 설정** (`eas.json`):
| 환경 | 채널 |
|------|------|
| development | `development` |
| preview | `preview` |
| production | `production` |

**동작 방식**:
1. 앱 시작 시 업데이트 확인
2. 업데이트가 있으면 로딩 화면 표시 + 다운로드
3. 다운로드 완료 즉시 앱 자동 재시작

**주요 파일**:
- `hooks/useAppUpdates.ts`: 업데이트 확인/다운로드/적용 로직
- `components/common/UpdateLoadingScreen.tsx`: 업데이트 중 로딩 UI
- `app/_layout.tsx`: `AppContent` 컴포넌트에서 업데이트 상태 관리

**배포 명령어**:
```bash
# JS 코드만 변경 시 (네이티브 코드 변경 없을 때)
eas update --channel production --message "v1.0.3 버그 수정"

# 배포된 업데이트 목록 확인
eas update:list --channel production
```

**주의사항**:
- 개발 환경(`__DEV__`)에서는 업데이트 기능 비활성화
- 네이티브 코드 변경 시 반드시 새 빌드 + 스토어 재배포 필요
- OTA로 배포 가능: JS/TS 코드, 에셋, 스타일만
