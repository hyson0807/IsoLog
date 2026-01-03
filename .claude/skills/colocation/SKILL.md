---
name: colocation
description: 컴포넌트를 페이지 근처로 colocation 리팩토링. components/ 폴더의 컴포넌트를 해당 페이지의 _components/ 폴더로 이동. "colocation 해줘", "components/calendar colocation", "calendar 컴포넌트 페이지 근처로 이동" 등의 요청 시 사용.
---

# Colocation Refactoring

컴포넌트를 해당 페이지 근처 `_components/` 폴더로 이동하는 리팩토링.

## Workflow

### 1. 분석

```bash
# 이동할 컴포넌트 확인
ls components/<target>/

# 사용처 확인
grep -r "from.*components/<target>" app/ --include="*.tsx"
```

### 2. 폴더 구조 변경 (단일 파일인 경우)

단일 파일(`<target>.tsx`)을 폴더 구조로 변경해야 하는 경우:

```bash
# 폴더 생성
mkdir -p app/(tabs)/<target>/_components

# 파일 이동
mv app/(tabs)/<target>.tsx app/(tabs)/<target>/index.tsx

# ⚠️ 중요: _layout.tsx 생성 필수!
```

**`_layout.tsx` 생성** (expo-router 폴더 구조 필수):
```tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

### 3. 컴포넌트 이동

```bash
# 컴포넌트 이동
mv components/<target>/*.tsx app/(tabs)/<target>/_components/
mv components/<target>/*.ts app/(tabs)/<target>/_components/
```

### 4. Import 경로 수정

변경 전:
```tsx
import { Component } from "@/components/<target>/Component";
```

변경 후:
```tsx
import { Component } from "./_components/Component";
```

### 5. 정리

```bash
# 빈 폴더 삭제
rmdir components/<target>/

# CLAUDE.md 문서 최신화
```

### 6. 커밋

```bash
git add -A && git commit -m "refactor: <target> 컴포넌트를 페이지 근처로 colocation"
```

## Example

**요청**: `components/calendar colocation 해줘`

**결과**:
```
# Before
components/calendar/
├── CalendarGrid.tsx
└── CalendarHeader.tsx

# After
app/(tabs)/calendar/_components/
├── CalendarGrid.tsx
└── CalendarHeader.tsx
```