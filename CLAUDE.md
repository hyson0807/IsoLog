# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IsoCare**는 이소티논(Isotretinoin) 복용자를 위한 글로벌 복용 관리 앱입니다.

### 핵심 기능
- **복용 체크**: 매일 앱에서 복용 여부를 체크하고 기록
- **피부 상태 기록**: 복용 체크 후 트러블/건조함 상태 기록, 데일리 케어 팁 제공
- **복용 주기 설정**: 매일/격일/3일/주1회 등 다양한 복용 주기 지원
- **캘린더**: 월별 복용 기록 조회, 과거 기록 수정, 미래 복용 예정일 표시
- **술 약속 경고**: 음주 예정일 D±4일 경고 표시, 복용 시 확인 팝업
- **데이터 영속성**: AsyncStorage로 앱 재시작 후에도 기록 유지
- **글로벌 지원**: 기기의 locale에 따라 날짜 형식 자동 변환

### 프리미엄 기능 (구현 완료)
- **복용 알림**: 복용일 밤 10시 로컬 알림 (프리미엄 전용)
- **광고 제거**: 프리미엄 유저는 AdMob 배너 미표시
- **익명 ID 시스템**: 로그인 없이 기기 중심 결제 관리

### 예정 기능
- **인앱 결제**: RevenueCat 연동 (일회성 결제)
- **로그인/동기화**: 소셜 로그인 + 클라우드 데이터 동기화
- **커뮤니티**: 사용자 간 정보 공유
- **다국어 지원 (i18n)**: 앱 내 텍스트 다국어 번역

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
- **Crypto**: `expo-crypto` for UUID generation
- **Localization**: `expo-localization` for global date formatting
- **Ads**: `react-native-google-mobile-ads` for AdMob banner ads
- **Path Aliases**: `@/*` maps to project root

### Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home screen (medication check)
│   ├── calendar.tsx     # Calendar screen (monthly view)
│   └── community.tsx    # Community screen (TBD)
├── _layout.tsx          # Root layout with MedicationProvider
├── settings.tsx         # Settings screen (TBD)
└── global.css           # Tailwind CSS imports

components/
├── common/              # Shared components
│   ├── Header.tsx              # 날짜 표시 + 메뉴 버튼
│   ├── DrawerMenu.tsx          # 사이드 드로어 메뉴
│   ├── WarningConfirmModal.tsx # 경고 확인 팝업
│   └── AdBanner.tsx            # Google AdMob 배너 광고
├── home/                # Home screen components
│   ├── StatusCard.tsx           # 상태 + 경고 메시지
│   ├── MedicationButton.tsx     # 복용 버튼 + 경고 스타일
│   ├── SkinRecordCard.tsx       # 피부 상태 기록 카드
│   ├── DailyTipCard.tsx         # 이소티논 케어 팁 카드
│   ├── FrequencySettingButton.tsx
│   └── FrequencyBottomSheet.tsx
├── calendar/            # Calendar components
│   ├── CalendarHeader.tsx    # Month navigation
│   ├── WeekdayRow.tsx        # Weekday labels
│   ├── CalendarGrid.tsx      # Date grid (6x7)
│   ├── DayCell.tsx           # Individual day cell + 경고 색상 + 메모 점 표시
│   ├── DayDetailSheet.tsx    # 복용/술약속/피부기록 토글 시트
│   └── MonthlySummary.tsx    # Monthly taken count
└── community/           # Community components (TBD)

contexts/                # React Context providers
├── MedicationContext.tsx    # Global state + AsyncStorage
└── PremiumContext.tsx       # Premium/알림 상태 관리

services/                # Business logic services
└── notificationService.ts   # 로컬 알림 예약/취소

hooks/                   # Custom React hooks
├── useMedicationSchedule.ts    # (legacy, use MedicationContext)
├── useMedicationReminder.ts    # 복용 알림 관리
└── useNotificationPermission.ts # 알림 권한 관리

constants/               # App constants
├── theme.ts             # Colors, spacing, fonts
├── frequency.ts         # Medication frequency options
└── skin.ts              # 피부 상태 옵션 (트러블/건조함)

types/                   # TypeScript type definitions
└── medication.ts        # FrequencyType, DayCellStatus, SkinRecord, etc.

utils/                   # Utility functions
└── dateUtils.ts         # Date formatting, calendar helpers
```

### Key Configurations

- **New Architecture**: Enabled
- **React Compiler**: Enabled
- **Typed Routes**: Enabled
- **TypeScript**: Strict mode

### Calendar Feature

캘린더는 4가지 날짜 상태를 시각화합니다:

| 상태 | 시점 | 스타일 |
|------|------|--------|
| `taken` | 과거/오늘 | 초록색 원형 배경 |
| `missed` | 과거 | 회색 텍스트 |
| `scheduled` | 미래 | 연한 주황색 배경 |
| `rest` | 미래 | 빈 배경 |
| `today` | 오늘(미복용) | 주황색 테두리 |
| `disabled` | 첫 복용일 이전 | 회색 비활성 |

**데이터 흐름**: `MedicationContext` → 홈/캘린더 양방향 동기화
**영속성**: AsyncStorage (`@isoCare/medication_data`)

### Drinking Warning Feature

술 약속 경고 시스템은 음주 전후 간 건강을 위해 휴약을 권장합니다.

**경고 레벨 (D±4일)**:

| 레벨 | 거리 | 색상 |
|------|------|------|
| `dday` | 당일 | `bg-red-600` |
| `day1` | D±1 | `bg-red-500` |
| `day2` | D±2 | `bg-red-400` |
| `day3` | D±3 | `bg-red-300` |
| `day4` | D±4 | `bg-red-100` |

**기능**:
- 캘린더에서 미래 날짜 클릭 → 술 약속 추가/삭제
- 경고 기간 날짜는 빨간색 그라데이션으로 표시
- 홈 화면 버튼/상태카드도 경고 색상 동기화
- 경고 기간 복용 시 확인 팝업 (Double Check)

### AdMob Integration

Google AdMob 배너 광고가 캘린더 탭 상단에 표시됩니다.

**설정**:
- iOS App ID: `ca-app-pub-2320452683835335~1158955767`
- Android App ID: `ca-app-pub-2320452683835335~1386186473`
- Banner Unit ID: `ca-app-pub-2320452683835335/2836845429`

**특징**:
- 개발 환경에서는 테스트 광고 표시 (`TestIds.ADAPTIVE_BANNER`)
- 프로덕션에서는 실제 광고 Unit ID 사용
- 웹 플랫폼에서는 광고 미표시
- `ANCHORED_ADAPTIVE_BANNER` 사이즈 사용 (화면 너비에 맞게 자동 조절)

**빌드 요구사항**:
- 네이티브 코드 포함으로 **Expo Go 미지원**
- Development Build 필요: `npx expo prebuild && npx expo run:ios`

### Skin Record Feature

복용 체크 후 피부 상태를 기록하는 기능입니다.

**흐름**:
1. 복용 체크 → `SkinRecordCard` 표시
2. 트러블 + 건조함 둘 다 선택 → 자동 저장 후 `DailyTipCard` 표시
3. 캘린더에서 과거 기록 확인/수정 가능

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
