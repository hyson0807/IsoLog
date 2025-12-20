# RevenueCat Integration

RevenueCat을 통한 인앱 결제 (평생 이용권)가 구현되어 있습니다.

## 상품 정보

- Product ID: `isolog1`
- 가격: $9.99 (평생 이용권, Non-consumable)
- Entitlement: `IsoLog Pro`

## 환경별 API Key (`eas.json`에서 관리)

| 환경 | iOS | Android |
|------|-----|---------|
| Development/Preview | `test_xxx` | `test_xxx` |
| Production | `appl_xxx` | `goog_xxx` |

**환경변수**:
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`: iOS용 RevenueCat API Key
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`: Android용 RevenueCat API Key

## 초기화 흐름

```
앱 시작 -> Purchases.configure({ apiKey, appUserID: deviceId })
                    |
         addCustomerInfoUpdateListener() 등록
                    |
         getCustomerInfo() -> entitlements.active['IsoLog Pro'] 확인
                    |
              isPremium 상태 업데이트
                    |
              광고 숨김 활성화
```

## 구매 흐름 (Offering -> Package -> Product)

```
Purchases.getOfferings()
         |
  offerings.current (현재 Offering)
         |
  offering.availablePackages[0] (첫 번째 Package)
         |
  Purchases.purchasePackage(package)
         |
  customerInfo.entitlements.active['IsoLog Pro'] 확인
         |
  isPremium = true -> 프리미엄 기능 활성화
```

## CustomerInfo 리스너

- 다른 기기에서 구매/환불 시 실시간 상태 업데이트
- 앱 포그라운드 복귀 시 자동 동기화

---

# Store Review (앱스토어 리뷰 요청)

`expo-store-review`를 사용하여 복용 체크 완료 후 네이티브 리뷰 팝업을 표시합니다.

## 트리거

**타이밍**: 복용 체크 완료 1초 후

**조건** (특정 복용 횟수에만):
- 3회, 10회, 30회, 60회, 100회

## 흐름

```
복용 버튼 클릭 -> toggleMedication() -> 1초 후 tryRequestReview()
                                              |
                              복용 횟수 확인 (3, 10, 30, 60, 100?)
                                              |
                              조건 충족 시 StoreReview.requestReview()
```

**주의사항**:
- iOS/Android 모두 OS가 연간 표시 횟수를 제한함 (호출해도 무시될 수 있음)
- 시뮬레이터에서 정확한 테스트 불가 (TestFlight/Internal Testing 필요)

---

## 관련 파일

- `constants/revenuecat.ts` - 플랫폼별 API Key, Entitlement ID, Product ID
- `contexts/PremiumContext.tsx` - RevenueCat 초기화, 구매 상태 관리, CustomerInfo 리스너
- `app/paywall.tsx` - 구매 UI, 결제/복원 처리
- `app/subscription.tsx` - 구독 관리 페이지
- `utils/deviceId.ts` - 익명 기기 ID 생성/관리
- `utils/reviewService.ts` - 리뷰 요청 로직 (`tryRequestReview`)

## 저장 키

- `@isoLog/medication_check_count` - 리뷰 요청용 복용 횟수