# Notification Feature

알림 권한 관리 및 알림 설정 기능입니다.

## 알림 설정 페이지

`app/notification-settings.tsx`에서 알림을 관리합니다.

### 구조

```
알림 설정 페이지
├── 마스터 토글 (전체 알림 ON/OFF)
└── 서브 알림 섹션
    ├── 복용 알림 (시간 설정 가능)
    └── 피부 상태 기록 알림 (시간 설정 가능)
```

### 알림 종류

| 알림 | 기본 시간 | 발송 조건 | 설명 |
|------|----------|----------|------|
| 복용 알림 | 22:00 | 복용일만 | 복용 체크 안내 |
| 피부 상태 기록 | 21:00 | 매일 | 피부 상태 기록 안내 |

## 권한 상태 (`PermissionStatus`)

| 상태 | 설명 |
|------|------|
| `granted` | 알림 권한 허용됨 |
| `denied` | 알림 권한 명시적 거부됨 (시스템 설정에서만 변경 가능) |
| `undetermined` | 아직 권한 요청 안 함 |

## 권한 거부 시 동작

- iOS에서 한번 거부하면 앱에서 다시 권한 요청해도 시스템이 자동 거부
- `denied` 상태면 Alert로 설정 이동 안내 표시
- `Linking.openSettings()`로 앱 설정 페이지 직접 이동

## 설정에서 돌아왔을 때 자동 동기화

- `AppState` 리스너로 백그라운드 -> 포그라운드 전환 감지
- `recheckPermission()`으로 권한 상태 재확인 (상태 반환)
- 권한이 `granted`로 바뀌면 자동으로 알림 토글 ON
- 권한이 `denied`로 바뀌면 자동으로 알림 토글 OFF

## 복용 알림 스케줄링

### 향후 복용일 알림 예약

앱 실행 시 **향후 7일간의 복용일**에 대해 알림을 미리 예약합니다.

```
앱 실행 또는 알림 설정 변경
         ↓
오늘부터 7일간 복용일 계산 (getUpcomingMedicationDays)
         ↓
각 복용일에 알림 예약 (scheduleUpcomingReminders)
  - 전체 알림 OFF면 모두 취소
  - 복용 알림 OFF면 모두 취소
  - 이미 복용한 날짜는 스킵
  - 이미 지난 시간은 스킵
         ↓
사용자가 앱을 안 열어도 7일간 알림 작동
```

- `DAYS_AHEAD = 7` (hooks/useMedicationReminder.ts)
- 7일 넘게 앱을 안 열면 알림이 안 옴 (필요시 값 증가 가능, iOS 최대 64개 제한 주의)

### 알림 예약 트리거 조건

다음 상황에서 알림이 재스케줄링됩니다:
- 앱 시작 시
- 전체 알림 토글 ON/OFF 변경 시
- 복용 알림 토글 ON/OFF 변경 시
- 알림 시간 변경 시
- 복용 주기 변경 시
- 복용 체크/해제 시

## 피부 상태 알림 스케줄링

- `DAILY` 트리거로 매일 같은 시간에 반복 알림
- 전체 알림 또는 피부 상태 알림 OFF 시 취소
- `useSkinConditionReminder` hook에서 관리

---

## 관련 파일

### 서비스
- `services/notificationService.ts` - 알림 권한, 예약/취소

### Hooks
- `hooks/useNotificationPermission.ts` - 권한 상태 관리, `recheckPermission` 제공
- `hooks/useNotificationSettings.ts` - 알림 설정 페이지 로직 (마스터 토글, AppState 동기화)
- `hooks/useMedicationReminder.ts` - 복용 알림 관리, 향후 7일 알림 예약
- `hooks/useSkinConditionReminder.ts` - 피부 상태 알림 관리

### 컴포넌트
- `components/notification-settings/` - 알림 설정 페이지 컴포넌트
  - `MasterToggle.tsx` - 전체 알림 토글
  - `NotificationItem.tsx` - 재사용 가능한 서브 알림 아이템
  - `TimeSettingRow.tsx` - 시간 설정 행
- `components/settings/NotificationTimeBottomSheet.tsx` - 알림 시간 선택
- `components/common/NotificationPromptSnackbar.tsx` - 알림 유도 스낵바

### 유틸리티
- `utils/dateUtils.ts` - `getUpcomingMedicationDays()` 향후 복용일 목록 계산
- `utils/timeFormat.ts` - 시간 포맷 함수

### 페이지
- `app/notification-settings.tsx` - 알림 설정 페이지
- `app/(tabs)/index.tsx` - 홈 화면 알림 토글 및 스낵바

## Context 상태 (NotificationSettingsContext)

| 상태 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `notificationEnabled` | boolean | false | 전체 알림 ON/OFF |
| `notificationTime` | {hour, minute} | 22:00 | 복용 알림 시간 |
| `medicationReminderEnabled` | boolean | true | 복용 알림 개별 ON/OFF |
| `skinConditionReminderEnabled` | boolean | true | 피부 상태 알림 개별 ON/OFF |
| `skinConditionReminderTime` | {hour, minute} | 21:00 | 피부 상태 알림 시간 |

## 번역 키

```
notification.title - 복용 알림
notification.description - 복용일에 알림을 보내드려요
notification.skinCondition - 피부 상태 기록
notification.skinConditionDesc - 매일 피부 상태를 기록하도록 알려드려요
notification.time - 알림 시간
notification.permissionDeniedTitle - Alert 제목
notification.permissionDeniedMessage - Alert 메시지
notification.openSettings - 설정 이동 버튼

notificationSettings.title - 알림 설정
notificationSettings.masterToggle - 알림 받기
notificationSettings.masterToggleDesc - 모든 알림을 켜거나 끕니다
notificationSettings.subNotifications - 알림 종류
notificationSettings.hint - 안내 문구
```