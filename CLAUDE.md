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
- **알림**: 복용 알림(복용일), 피부 상태 기록 알림(매일)
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
| 콘텐츠 큐레이션 (정보탭) | `.claude/docs/content-curation.md` |

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
- **State Management**: React Context API (`MedicationContext`, `PremiumContext`, `NotificationSettingsContext`)
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
- **Path Aliases**: `@/*` maps to project root, `@lib/*` maps to lib folder

### Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx      # Tab bar configuration
│   ├── home/
│   │   └── index.tsx        # 홈 화면 (/home)
│   ├── calendar/
│   │   └── index.tsx        # 캘린더 화면 (/calendar)
│   └── info/            # Info tab (중첩 라우트)
│       ├── _layout.tsx      # Stack navigation
│       ├── index.tsx        # 정보 목록 (/info)
│       ├── content.tsx      # 콘텐츠 상세 WebView (/info/content)
│       └── liked.tsx        # 좋아요한 콘텐츠 (/info/liked)
├── tracking.tsx         # Tracking screen (/tracking, DrawerMenu에서 접근)
├── settings/            # Settings (colocation)
│   ├── _components/     # settings 전용 컴포넌트 (PremiumSection, NotificationToggle, LanguageBottomSheet, NotificationTimeBottomSheet)
│   ├── index.tsx        # 설정 페이지 (/settings)
│   └── notification-settings/  # 알림 설정 (중첩 colocation)
│       ├── _components/     # notification-settings 전용 컴포넌트 (MasterToggle, NotificationItem, TimeSettingRow)
│       └── index.tsx        # 알림 설정 페이지 (/settings/notification-settings)
├── (premium)/           # 프리미엄 관련 그룹 (URL에 미포함)
│   ├── paywall.tsx      # 프리미엄 구매 페이지 (/paywall)
│   └── subscription.tsx # 구독 관리 페이지 (/subscription)
├── legal/               # 법적 문서
│   ├── privacy.tsx      # 개인정보보호정책 (/legal/privacy)
│   └── terms.tsx        # 이용약관 (/legal/terms)
├── onboarding/          # Onboarding (colocation)
│   ├── _components/     # onboarding 전용 컴포넌트 (WelcomePage, FrequencyPage, DateSelectPage, MedicationReminderPage, SkinReminderPage, PageIndicator)
│   └── index.tsx        # 온보딩 화면 (첫 실행 시 fullScreenModal)
├── index.tsx            # 루트 리다이렉트 (/home으로 이동)
├── _layout.tsx          # Root layout with Provider 설정
└── global.css           # Tailwind CSS imports

components/
└── feedback/            # UpdateLoadingScreen (루트 레이아웃용)

lib/
└── features/            # 탭별 feature 컴포넌트
    ├── home/            # Header, StatusCard, MedicationCheckCard, SkinRecordCard, DailyTipCard, DrawerMenu, WarningConfirmModal, NotificationPromptSnackbar
    ├── calendar/        # CalendarHeader, WeekdayRow, CalendarGrid, DayCell, DayDetailSheet, FrequencySettingButton, FrequencyBottomSheet, AdBanner
    └── info/            # ContentCard, InfoMenuSidebar

contexts/                # MedicationContext, PremiumContext, NotificationSettingsContext, LikedContentsContext
services/                # notificationService, contentService
hooks/                   # useIsAfterHour, useMedicationReminder, useSkinConditionReminder, useOnboarding, useAppUpdates, useNotificationPermission, useNotificationSettings, useTodayDate, useInterstitialAd
constants/               # theme, frequency, skin, revenuecat, admob
types/                   # medication.ts
utils/                   # dateUtils, deviceId, reviewService, timeFormat
locales/                 # ko.json, en.json, index.ts
scripts/                 # 콘텐츠 크롤링 및 관리 스크립트
├── fetch-contents.ts          # Google 검색 크롤링
├── fetch-naver-contents.ts    # 네이버 검색 크롤링
├── fetch-contents-archive.ts  # 아카이브 크롤링
```

### Key Configurations

- **New Architecture**: Enabled
- **React Compiler**: Enabled
- **Typed Routes**: Enabled
- **TypeScript**: Strict mode
- **Tab Navigation**: `initialRouteName="home"` (홈이 기본 화면, 탭 순서: 캘린더 | 홈 | 정보)
