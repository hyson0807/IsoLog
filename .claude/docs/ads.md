# AdMob Integration

Google AdMob 광고가 앱에 통합되어 있습니다.

## App ID (app.json 설정)

- iOS: `ca-app-pub-2320452683835335~1158955767`
- Android: `ca-app-pub-2320452683835335~1386186473`

## Ad Unit ID (`constants/admob.ts`에서 관리)

| 광고 타입 | iOS | Android |
|----------|-----|---------|
| 배너 | `ca-app-pub-2320452683835335/2836845429` | `ca-app-pub-2320452683835335/1979167126` |
| 전면 | `ca-app-pub-2320452683835335/9737597014` | `ca-app-pub-2320452683835335/1240159899` |

## 광고 위치

- **배너 광고**: 캘린더 탭 상단 (`AdBanner` 컴포넌트)
- **전면 광고**: 피부 기록 완료 후에만 (`useInterstitialAd` 훅)

## 특징

- 개발 환경: 테스트 광고 자동 사용 (`TestIds`)
- 프리미엄 유저: 모든 광고 비표시
- 웹 플랫폼: 광고 미지원
- **AppState 리스너**: 앱이 백그라운드에서 포그라운드로 돌아올 때 광고 자동 재로드
- **에러 재시도**: 광고 로드 실패 시 3초 후 자동 재시도 (전면 광고)

## 빌드 요구사항

- 네이티브 코드 포함으로 **Expo Go 미지원**
- Development Build 필요: `npx expo prebuild && npx expo run:ios`

---

## 관련 파일

- `constants/admob.ts` - AdMob 플랫폼별 Ad Unit ID
- `lib/features/calendar/AdBanner.tsx` - Google AdMob 배너 광고
- `hooks/useInterstitialAd.ts` - 전면 광고 관리
- `contexts/PremiumContext.tsx` - 프리미엄 상태로 광고 표시 여부 결정