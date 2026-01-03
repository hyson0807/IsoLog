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

### 2. 폴더 생성 및 파일 이동

```bash
# _components 폴더 생성
mkdir -p app/(tabs)/<target>/_components

# 컴포넌트 이동
mv components/<target>/*.tsx app/(tabs)/<target>/_components/
```

### 3. Import 경로 수정

변경 전:
```tsx
import { Component } from "@/components/<target>/Component";
```

변경 후:
```tsx
import { Component } from "./_components/Component";
```

### 4. 정리

```bash
# 빈 폴더 삭제
rmdir components/<target>/

# CLAUDE.md 문서 최신화
```

### 5. 커밋

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