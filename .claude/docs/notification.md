# Notification Permission Feature

알림 권한 관리 및 권한 거부 시 설정 이동 안내 기능입니다.

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

## 적용 위치

- 설정 > 알림 토글 (`NotificationToggle.tsx`)
- 홈 헤더 알림 토글 (`Header.tsx` + `index.tsx`)
- 복용 완료 후 알림 유도 스낵바 (`NotificationPromptSnackbar.tsx`)

## 설정에서 돌아왔을 때 자동 동기화

- `AppState` 리스너로 백그라운드 -> 포그라운드 전환 감지
- `recheckPermission()`으로 권한 상태 재확인
- 권한이 `granted`로 바뀌면 자동으로 알림 토글 ON
- 권한이 `denied`로 바뀌면 자동으로 알림 토글 OFF

## 알림 스케줄링

- 복용일 지정 시간에 로컬 알림 예약
- 기본 알림 시간: 오후 10시
- 바텀시트 타임피커로 원하는 시간 설정 가능

### 향후 복용일 알림 예약

앱 실행 시 **향후 7일간의 복용일**에 대해 알림을 미리 예약합니다.

```
앱 실행 또는 알림 설정 변경
         ↓
오늘부터 7일간 복용일 계산 (getUpcomingMedicationDays)
         ↓
각 복용일에 알림 예약 (scheduleUpcomingReminders)
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
- 알림 토글 ON/OFF 변경 시
- 알림 시간 변경 시
- 복용 주기 변경 시
- 복용 체크/해제 시

---

## 관련 파일

- `services/notificationService.ts` - 알림 권한, 예약/취소, `scheduleUpcomingReminders()`
- `hooks/useNotificationPermission.ts` - `permissionStatus`, `recheckPermission` 제공
- `hooks/useMedicationReminder.ts` - 복용 알림 관리, 향후 7일 알림 예약
- `utils/dateUtils.ts` - `getUpcomingMedicationDays()` 향후 복용일 목록 계산
- `components/settings/NotificationToggle.tsx` - 설정 페이지 알림 토글
- `components/settings/NotificationTimeBottomSheet.tsx` - 알림 시간 선택
- `components/common/NotificationPromptSnackbar.tsx` - 알림 유도 스낵바
- `app/(tabs)/index.tsx` - 홈 화면 알림 토글 및 스낵바

## 번역 키

- `notification.title` - 복용 알림
- `notification.description` - 복용일에 알림을 보내드려요
- `notification.time` - 알림 시간
- `notification.permissionDeniedTitle` - Alert 제목
- `notification.permissionDeniedMessage` - Alert 메시지
- `notification.openSettings` - 설정 이동 버튼