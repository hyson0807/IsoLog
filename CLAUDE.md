# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**isoCare**는 이소티논(Isotretinoin) 복용자를 위한 글로벌 복용 관리 앱입니다.

### 핵심 기능
- **복용 체크**: 매일 앱에서 복용 여부를 체크하고 기록
- **복용 주기 설정**: 매일/격일/3일/주1회 등 다양한 복용 주기 지원
- **캘린더**: 월별 복용 기록 조회, 과거 기록 수정, 미래 복용 예정일 표시
- **술 약속 경고**: 음주 예정일 D±4일 경고 표시, 복용 시 확인 팝업
- **데이터 영속성**: AsyncStorage로 앱 재시작 후에도 기록 유지
- **글로벌 지원**: 기기의 locale에 따라 날짜 형식 자동 변환

### 예정 기능
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
- **State Management**: React Context API (`MedicationContext`)
- **Storage**: AsyncStorage for data persistence
- **Localization**: `expo-localization` for global date formatting
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
└── global.css           # Tailwind CSS imports

components/
├── common/              # Shared components
│   ├── Header.tsx
│   └── WarningConfirmModal.tsx  # 경고 확인 팝업
├── home/                # Home screen components
│   ├── StatusCard.tsx           # 상태 + 경고 메시지
│   ├── MedicationButton.tsx     # 복용 버튼 + 경고 스타일
│   ├── FrequencySettingButton.tsx
│   └── FrequencyBottomSheet.tsx
├── calendar/            # Calendar components
│   ├── CalendarHeader.tsx    # Month navigation
│   ├── WeekdayRow.tsx        # Weekday labels
│   ├── CalendarGrid.tsx      # Date grid (6x7)
│   ├── DayCell.tsx           # Individual day cell + 경고 색상
│   ├── DayDetailSheet.tsx    # 복용/술약속 토글 시트
│   └── MonthlySummary.tsx    # Monthly taken count
└── community/           # Community components (TBD)

contexts/                # React Context providers
└── MedicationContext.tsx    # Global state + AsyncStorage

hooks/                   # Custom React hooks
└── useMedicationSchedule.ts # (legacy, use MedicationContext)

constants/               # App constants
├── theme.ts             # Colors, spacing, fonts
└── frequency.ts         # Medication frequency options

types/                   # TypeScript type definitions
└── medication.ts        # FrequencyType, DayCellStatus, etc.

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
