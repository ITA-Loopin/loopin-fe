# AGENTS.md

이 저장소에서 작업할 때 지켜야 하는 코딩 컨벤션을 모은 문서입니다. 사람이든 자동화 에이전트든 코드를 작성/수정할 때 이 규칙을 따릅니다.

## 색상 사용

직접 색상값을 코드에 박지 않습니다. 다음 패턴은 ESLint 룰 `no-restricted-syntax`로 모두 **error**로 차단됩니다.

| 패턴                    | 예시                                                 |
| ----------------------- | ---------------------------------------------------- |
| 6자리 hex               | `bg-[#FF5741]`, `style={{ color: "#000000" }}`       |
| CSS 변수 arbitrary      | `bg-[var(--primary-main)]`, `text-[var(--gray-800)]` |
| rgb / rgba / hsl / hsla | `style={{ color: "rgb(255, 0, 0)" }}`                |

### 대안

`src/app/globals.css`(또는 tailwind 설정)에 정의된 **토큰 클래스**를 사용합니다.

```tsx
// 금지
<div className="bg-[var(--primary-main)] text-[#FF5741]" />

// 권장
<div className="bg-primary text-primary" />
```

필요한 토큰이 정의돼 있지 않으면 `globals.css`에 먼저 추가한 뒤 사용합니다.

### 토큰 체계

이 저장소에는 두 종류의 토큰이 공존합니다.

- **Loopin 토큰**: `gray-*`, `primary-*`, `sub-*`, `brand-*`. 자체 컴포넌트 및 페이지에서 사용하는 기본 토큰.
- **shadcn 토큰**: `background`, `foreground`, `border`, `ring`, `card`, `popover`, `muted`, `accent`, `destructive`, `secondary`. shadcn 기반 컴포넌트(`components/ui/sheet`, `components/ui/context-menu` 등)와 base layer 글로벌 스타일 전용. 자체 컴포넌트에서는 사용하지 않음.

### Primary 컬러 역할

`primary-main`(#FF543F, 진함)과 `primary-500`(#FF7765, 밝음)은 Figma에서도 별개 토큰입니다. 합치지 말고 아래 4가지 컨텍스트 규칙에 따라 골라 씁니다.

| 컨텍스트                                                           | 텍스트 토큰                     |
| ------------------------------------------------------------------ | ------------------------------- |
| `bg-primary-200` 배경 위 (라이트 톤 배지/버튼 selected)            | `text-primary-main` (예외 없음) |
| 흰 배경 카드/말풍선 안 본문 강조                                   | `text-primary-main`             |
| 자유 배치 단독 라벨/안내문 (스피커 이름, 로딩 메시지, 캘린더 일자) | `text-primary-500`              |
| 서브/캡션 텍스트                                                   | `text-primary-400`              |

fill 배경:

| 컨텍스트                                      | 배경 토큰        |
| --------------------------------------------- | ---------------- |
| Primary 액션 fill (Button, 활성 배지, 진행바) | `bg-primary-500` |
| `primary-500` fill의 hover                    | `bg-primary-700` |
| 라이트 톤 배지/태그 배경                      | `bg-primary-200` |

### 기존 코드의 inline disable

마이그레이션 전이라 기존 파일에는 다음과 같은 inline disable 주석이 부착돼 있습니다.

```tsx
// JSX attribute 위치
<div
  // eslint-disable-next-line no-restricted-syntax
  className="bg-[var(--gray-800)]"
/>

// JSX child 위치
<section>
  {/* eslint-disable-next-line no-restricted-syntax */}
  <h2 className="text-[#121212]">제목</h2>
</section>
```

이 주석들은 토큰 정리 작업이 끝나면 일괄 제거됩니다. **새 코드/새 라인에는 절대 disable 주석을 부착하지 않습니다** — 새 색상이 필요하면 토큰을 먼저 추가합니다.

## 공통 컴포넌트

### 폴더 역할 (`ui/` vs `common/`)

디자인 시스템 컴포넌트는 두 폴더로 나뉘며 역할이 다릅니다.

| 폴더                | 정체                                                   | 디자인 결정 포함 | 페이지/feature에서 직접 import |
| ------------------- | ------------------------------------------------------ | ---------------- | ------------------------------ |
| `components/ui/`    | shadcn 원본(primitive). Radix 래퍼에 가까운 상태로 유지 | 없음/최소        | ❌ (원칙적으로 `common/`만 사용) |
| `components/common/` | loopin 디자인이 입혀진 공통 컴포넌트. `ui/` primitive를 조립·확장 | 있음 (토큰, variant, 사이즈) | ✅                              |

원칙:

- shadcn CLI로 받은 컴포넌트는 `ui/`에 그대로 둡니다. loopin 토큰/variant를 입히는 순간 `common/`으로 이동합니다.
- 새 공통 컴포넌트는 가능한 한 `ui/` primitive를 기반으로 만듭니다. 대응되는 shadcn primitive가 없을 때만 자체 구현합니다 (`Header`, `LoadingSpinner` 등).
- `common/` 컴포넌트는 named export, PascalCase 파일명 (`Button.tsx`)을 따릅니다.

### 공통 컴포넌트 우선 사용

`components/common/`에 같은 역할의 공통 컴포넌트가 있으면 가급적 그걸 씁니다. raw HTML 요소나 페이지 내 ad-hoc 구현보다 공통 컴포넌트를 먼저 고려합니다.

| 역할               | 우선 사용                       |
| ------------------ | ------------------------------- |
| 버튼               | `<Button />`                    |
| 세그먼트/선택 그룹 | `<SegmentedControl />`          |
| 모달               | `<Modal />`, `<ConfirmModal />` |
| 바텀시트           | `<BottomSheet />`               |
| 헤더               | `<Header />`                    |

공통 컴포넌트가 디자인 요구를 못 따라가면 새 variant를 추가하거나 별도 공통 컴포넌트를 만든 뒤 그것을 씁니다. 일회성 ad-hoc 구현은 지양합니다.

## 코드 스타일

### JSX 변수 추출로 가독성 향상

return 안에 같은 종류의 JSX 블록이 여러 개 늘어서거나 조건부 분기가 복잡해지면, **각 JSX 블록을 변수로 추출**해서 return을 평탄화합니다.

```tsx
// 권장
const saveButton = (
  <Button variant="primary" onClick={onSave}>
    저장
  </Button>
);

const deleteButton = (
  <Button variant="secondary" onClick={onDelete}>
    삭제
  </Button>
);

const cancelButton = (
  <Button variant="outline" onClick={onCancel}>
    취소
  </Button>
);

return (
  <div className="flex gap-2">
    {saveButton}
    {deleteButton}
    {cancelButton}
  </div>
);
```

- return 안에서 props/className이 길어지면 시각 구조가 가려집니다. 변수로 빼면 return은 레이아웃만 표현하게 됩니다.
- 조건부 분기(`isEditing ? <X /> : <Y />`)도 변수로 분리하면 가독성이 좋아집니다.
- 한 줄짜리 단순 JSX는 굳이 추출하지 않습니다.
