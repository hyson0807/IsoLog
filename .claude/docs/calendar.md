# Calendar Feature

캘린더는 날짜 상태를 시각화합니다:

| 상태 | 시점 | 스타일 |
|------|------|--------|
| `taken` | 과거/오늘 | 우측상단 초록색 체크 아이콘 |
| `missed` | 과거 | 회색 텍스트 |
| `scheduled` | 미래 | 연한 주황색 배경 |
| `rest` | 미래 | 빈 배경 |
| `today` | 오늘(미복용) | 주황색 테두리 |
| `disabled` | 첫 복용일 이전 | 회색 비활성 |
| `drinking_*` | 술 약속 D+-4일 | 날짜 아래 빨간색 밑줄 (그라데이션) |

**오늘 + 음주경고 동시 표시**: 오늘이 음주 예정일 D+-4일 범위에 있으면 주황색 테두리와 빨간색 밑줄이 동시에 표시됨

**범례 팝오버**: 헤더 우측 i 버튼 클릭 시 캘린더 안내 표시

**데이터 흐름**: `MedicationContext` -> 홈/캘린더 양방향 동기화
**영속성**: AsyncStorage (`@isoLog/medication_data`)

---

## 자정 날짜 변경 자동 갱신

`useTodayDate` 훅을 통해 자정(00:00)에 날짜가 바뀌면 UI가 실시간으로 갱신됩니다.

**동작 방식**:
- 자정까지 남은 시간 계산 후 `setTimeout` 설정
- `AppState` 리스너로 백그라운드 -> 포그라운드 전환 시 날짜 확인
- `MedicationContext`에서 `today`를 state로 관리하여 전체 UI 자동 갱신

**영향 범위**:
- 홈 화면: 오늘 복용 상태, 피부 기록
- 캘린더: 오늘 날짜 하이라이트
- 헤더: 날짜 표시

---

## Drinking Warning Feature

술 약속 경고 시스템은 음주 전후 간 건강을 위해 휴약을 권장합니다.

**경고 레벨 (D+-4일)** - 날짜 아래 밑줄로 표시:

| 레벨 | 거리 | 밑줄 색상 |
|------|------|----------|
| `dday` | 당일 | `bg-red-600` (진한 빨강) |
| `day1` | D+-1 | `bg-red-500` |
| `day2` | D+-2 | `bg-red-400` |
| `day3` | D+-3 | `bg-red-300` |
| `day4` | D+-4 | `bg-red-200` (연한 빨강) |

**기능**:
- 캘린더에서 미래 날짜 클릭 -> 술 약속 추가/삭제
- 경고 기간 날짜는 숫자 아래 빨간색 밑줄로 표시 (그라데이션)
- 술 약속 당일은 우측상단 와인 아이콘 표시
- 홈 화면 버튼/상태카드도 경고 색상 동기화
- 경고 기간 복용 시 확인 팝업 (Double Check)

---

## Frequency Setting Feature

복용 주기를 설정하는 기능입니다. **캘린더 탭 하단**에서 설정합니다.

**FrequencyType**:
| 타입 | 라벨 | 설명 |
|------|------|------|
| `none` | 복용 안함 | 복용 주기 미설정 (모든 날이 휴약일) |
| `daily` | 매일 복용 | 매일 1알 |
| `every2days` | 격일 복용 | 2일에 1알 |
| `every3days` | 3일에 1알 | 3일에 1알 |
| `weekly` | 주 1회 | 7일에 1알 |

**UI 구성** (`FrequencyBottomSheet`):
- 가로 스크롤 카드 형태로 주기 선택
- 선택된 카드 다시 클릭 시 -> `none`(복용 안함)으로 해제
- `daily`/`none` 외 선택 시 -> 시작일 설정 섹션 표시
- 시작일 변경 시 완료 버튼으로 확정

**시작일(referenceDate)**:
- 격일/3일/주1회 등 주기성 복용에서 기준점 역할
- 기본값: 오늘
- 과거/미래 날짜 모두 선택 가능
- 상대 텍스트 표시: (오늘), (내일), (어제)

**동작 방식**:
- 주기 선택 -> 즉시 반영
- 시작일 변경 -> 완료 버튼 클릭 시 반영
- `frequencyDays = 0` (none) -> 모든 날이 복용일 아님, 캘린더 scheduled 표시 없음

---

## 관련 파일

- `components/calendar/CalendarHeader.tsx` - Month navigation + 범례 팝오버
- `components/calendar/CalendarGrid.tsx` - Date grid (6x7)
- `components/calendar/DayCell.tsx` - Individual day cell
- `components/calendar/DayDetailSheet.tsx` - 복용/술약속/피부기록 토글 시트
- `components/calendar/FrequencyBottomSheet.tsx` - 복용 주기 + 시작일 설정
- `hooks/useTodayDate.ts` - 자정 날짜 변경 시 자동 갱신
- `contexts/MedicationContext.tsx` - 복용 데이터 관리