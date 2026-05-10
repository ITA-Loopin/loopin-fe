# AGENTS.md

이 저장소에서 작업할 때 지켜야 하는 코딩 컨벤션을 모은 문서입니다. 사람이든 자동화 에이전트든 코드를 작성/수정할 때 이 규칙을 따릅니다.

## 색상 사용

직접 색상값을 코드에 박지 않습니다. 다음 패턴은 ESLint 룰 `no-restricted-syntax`로 모두 **error**로 차단됩니다.

| 패턴 | 예시 |
|---|---|
| 6자리 hex | `bg-[#FF5741]`, `style={{ color: "#000000" }}` |
| CSS 변수 arbitrary | `bg-[var(--primary-main)]`, `text-[var(--gray-800)]` |
| rgb / rgba / hsl / hsla | `style={{ color: "rgb(255, 0, 0)" }}` |

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

| 컨텍스트 | 텍스트 토큰 |
|---|---|
| `bg-primary-200` 배경 위 (라이트 톤 배지/버튼 selected) | `text-primary-main` (예외 없음) |
| 흰 배경 카드/말풍선 안 본문 강조 | `text-primary-main` |
| 자유 배치 단독 라벨/안내문 (스피커 이름, 로딩 메시지, 캘린더 일자) | `text-primary-500` |
| 서브/캡션 텍스트 | `text-primary-400` |

fill 배경:

| 컨텍스트 | 배경 토큰 |
|---|---|
| Primary 액션 fill (Button, 활성 배지, 진행바) | `bg-primary-500` |
| `primary-500` fill의 hover | `bg-primary-700` |
| 라이트 톤 배지/태그 배경 | `bg-primary-200` |

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

- 공통 Button: `@/components/ui/button`의 `<Button />`을 사용합니다. variants: `primary | secondary | outline | ghost | icon`, sizes: `sm | md | lg`.
- 이전의 `PrimaryButton`, `IconButton`은 제거됐습니다 (디자인 시스템으로 통합).

## 커밋 / 자동화

- 자동화 에이전트는 사용자 명시 지시 없이 `git commit`을 실행하지 않습니다 (사용자 직접 수행).
