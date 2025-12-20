# OTA Updates (EAS Update)

`expo-updates`를 사용하여 앱스토어 재배포 없이 JS 코드를 업데이트합니다.

## 설정 (`app.json`)

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

## 채널 설정 (`eas.json`)

| 환경 | 채널 |
|------|------|
| development | `development` |
| preview | `preview` |
| production | `production` |

## 동작 방식

1. 앱 시작 시 업데이트 확인
2. 업데이트가 있으면 로딩 화면 표시 + 다운로드
3. 다운로드 완료 즉시 앱 자동 재시작

## 배포 명령어

```bash
# JS 코드만 변경 시 (네이티브 코드 변경 없을 때)
eas update --channel production --message "v1.0.3 버그 수정"

# 배포된 업데이트 목록 확인
eas update:list --channel production
```

## 주의사항

- 개발 환경(`__DEV__`)에서는 업데이트 기능 비활성화
- 네이티브 코드 변경 시 반드시 새 빌드 + 스토어 재배포 필요
- OTA로 배포 가능: JS/TS 코드, 에셋, 스타일만

---

## 관련 파일

- `hooks/useAppUpdates.ts` - 업데이트 확인/다운로드/적용 로직
- `components/common/UpdateLoadingScreen.tsx` - 업데이트 중 로딩 UI
- `app/_layout.tsx` - `AppContent` 컴포넌트에서 업데이트 상태 관리