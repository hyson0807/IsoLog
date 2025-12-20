# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IsoLog**는 이소티논(Isotretinoin) 복용자를 위한 글로벌 복용 관리 앱입니다.

### 핵심 기능
- **복용 체크**: 매일 앱에서 복용 여부를 체크하고 기록
- **피부 상태 기록**: 트러블/건조함 상태 기록, 메모
- **복용 주기 설정**: 복용 안함/매일/격일/3일/주1회 등 지원
- **캘린더**: 월별 복용 기록 조회, 과거 기록 수정
- **술 약속 경고**: 음주 예정일 D±4일 경고
- **복용 알림**: 복용일 지정 시간에 로컬 알림
- **프리미엄**: 광고 제거 (RevenueCat 연동)
- **다국어**: 한국어 (ko), 영어 (en)

### 예정 기능
- 로그인/동기화
- 커뮤니티

## 기능별 상세 문서

| 기능 | 문서 |
|------|------|
| 캘린더, 복용 주기, 음주 경고 | `.claude/docs/calendar.md` |
| 홈 화면 UI, 피부 기록 | `.claude/docs/home.md` |
| 알림 권한, 리마인더 | `.claude/docs/notification.md` |
| RevenueCat, 인앱 결제, 스토어 리뷰 | `.claude/docs/premium.md` |
| AdMob 광고 | `.claude/docs/ads.md` |
| 다국어 지원 | `.claude/docs/i18n.md` |
| OTA 업데이트 | `.claude/docs/ota-updates.md` |
| 온보딩 | `.claude/docs/onboarding.md` |

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
- **Time Picker**: `@react-native-community/datetimepicker`
- **Crypto**: `expo-crypto` for UUID generation
- **Localization**: `expo-localization` for device locale detection
- **i18n**: `i18next` + `react-i18next`
- **Ads**: `react-native-google-mobile-ads` for AdMob
- **IAP**: `react-native-purchases` for RevenueCat
- **Store Review**: `expo-store-review`
- **OTA Updates**: `expo-updates` for EAS Update
- **Clipboard**: `expo-clipboard`
- **Path Aliases**: `@/*` maps to project root

### Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home screen (medication check)
│   ├── calendar.tsx     # Calendar screen (monthly view)
│   └── tracking.tsx     # Tracking screen
├── _layout.tsx          # Root layout with Provider 설정
├── settings.tsx         # 설정 페이지
├── paywall.tsx          # 프리미엄 구매 페이지
├── subscription.tsx     # 구독 관리 페이지
└── global.css           # Tailwind CSS imports

components/
├── common/              # Header, DrawerMenu, AdBanner, etc.
├── home/                # StatusCard, MedicationCheckCard, SkinRecordCard, DailyTipCard
├── calendar/            # CalendarHeader, CalendarGrid, DayCell, DayDetailSheet, FrequencyBottomSheet
├── settings/            # PremiumSection, NotificationToggle, LanguageBottomSheet
├── onboarding/          # OnboardingBottomSheet
└── tracking/            # (TBD)

contexts/                # MedicationContext, PremiumContext
services/                # notificationService
hooks/                   # useMedicationReminder, useNotificationPermission, useInterstitialAd, etc.
constants/               # theme, frequency, skin, revenuecat, admob
types/                   # medication.ts
utils/                   # dateUtils, deviceId, reviewService
locales/                 # ko.json, en.json, index.ts
```

### Key Configurations

- **New Architecture**: Enabled
- **React Compiler**: Enabled
- **Typed Routes**: Enabled
- **TypeScript**: Strict mode
- **Tab Navigation**: `initialRouteName="index"` (홈이 기본 화면, 탭 순서: 캘린더 | 홈 | 트래킹)
