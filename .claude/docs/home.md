# Home Screen UI

홈 화면은 복용일 여부와 21시 기준으로 다른 UI를 표시합니다. `useIsAfter21` 훅으로 실시간 갱신됩니다.

## 복용일

| 시간 | 상태 | 표시 컴포넌트 |
|------|------|---------------|
| 21시 전 | 미복용 | `MedicationCheckCard` + `DailyTipCard` |
| 21시 전 | 복용완료 | `DailyTipCard` |
| 21시 이후 | 미복용 + 피부기록 미완료 | `MedicationCheckCard` + `SkinRecordCard` |
| 21시 이후 | 미복용 + 피부기록 완료 | `MedicationCheckCard` + `DailyTipCard` |
| 21시 이후 | 복용완료 + 피부기록 미완료 | `SkinRecordCard` |
| 21시 이후 | 복용완료 + 피부기록 완료 | `DailyTipCard` |

## 휴약일

| 시간 | 상태 | 표시 컴포넌트 |
|------|------|---------------|
| 21시 전 | - | `DailyTipCard` |
| 21시 이후 | 피부기록 미완료 | `SkinRecordCard` |
| 21시 이후 | 피부기록 완료 | `DailyTipCard` |

**MedicationCheckCard**: 직사각형 카드 스타일의 복용 체크 UI. 체크하면 사라짐. 경고 기간(D+-4일)에는 빨간색 테두리/배경 표시.

**실시간 갱신**:
- 자정(00:00): 날짜 변경 시 UI 자동 갱신 (`useTodayDate` 훅)
- 21시: 시간 도달 시 UI 자동 변경 (`useIsAfter21` 훅의 타이머 + AppState 리스너)

---

## Skin Record Feature

피부 상태를 기록하는 기능입니다.

**흐름**:
1. 홈 (21시 전): `MedicationCheckCard` 체크 -> `DailyTipCard` 표시
2. 홈 (21시 이후): `MedicationCheckCard` 체크 -> `SkinRecordCard` 표시 -> 트러블 + 건조함 선택 -> `DailyTipCard` 표시
3. 캘린더: 날짜 선택 -> 피부 상태(과거/오늘만) + 메모(미래 포함) 기록 가능

**캘린더 DayDetailSheet 구조**:
- 피부 상태 (트러블/건조함): `canEdit`일 때만 편집 (과거/오늘)
- 메모: 모든 날짜에서 편집 가능 (미래 포함)

**트러블 상태** (`TroubleLevel`):
| 값 | 라벨 | 이모지 |
|-----|------|--------|
| `calm` | 잠잠해요 | sparkle |
| `few` | 몇 개 났어요 | sad |
| `severe` | 심해졌어요 | warning |

**건조함 정도** (`DrynessLevel`):
| 값 | 라벨 | 이모지 |
|-----|------|--------|
| `moist` | 촉촉해요 | relieved |
| `normal` | 보통이에요 | neutral |
| `dry` | 건조해요 | cactus |

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

---

## 관련 파일

- `app/(tabs)/index.tsx` - 홈 화면
- `components/home/StatusCard.tsx` - 상태 + 경고 메시지
- `components/home/MedicationCheckCard.tsx` - 복용 체크 카드
- `components/home/SkinRecordCard.tsx` - 피부 상태 기록 카드
- `components/home/DailyTipCard.tsx` - 이소티논 케어 팁 카드
- `hooks/useIsAfter21.ts` - 21시 이후 여부 실시간 체크
