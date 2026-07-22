# ship — 코드 변경 배포 자동화 (하네스 중립 명세)

워킹 트리의 코드 변경사항을 검증하고 배포까지 자동화한다.
코드 수정이 이미 완료된 상태에서 사용한다 — 문제 분석·코드 변경은 수행하지 않는다.

> **이 파일은 하네스 중립 「진실의 원천」이다.** 직접 실행 대상이 아니라, 사용하는 LLM 하네스의 진입 어댑터를 통해 실행된다:
> - Claude Code → `.claude/commands/ship.md`
> - Codex → `.codex/skills/ship/SKILL.md`
> - Gemini → `.gemini/commands/ship.toml`
>
> 각 어댑터는 **폴링 모드**와 **안전 규칙 적용 방식**(훅 유무)을 지정한다. 배포(Phase 4)의 CI·Vercel 체크 폴링은 `automation/pipeline.md`의 「폴링 실행 규칙」에 정의된 **하네스별 모드**를 따른다.

## 워크플로우 전제 (fe)

- **PR-퍼스트**: 이슈를 생성하지 않는다. `<prefix>/<설명>` 브랜치 → `main` PR → 머지 → Vercel 자동 배포. 사람이 이미 만든 이슈가 있으면 PR 본문 `Closes #N`으로만 연결한다(선택).
- **라벨·담당자는 부여하지 않는다.** `.github/workflows/auto-label.yml`(`srvaroa/labeler`)이 PR 제목·브랜치·작성자 기준으로 라벨을, `auto-assign.yml`이 작성자 할당을 자동 처리한다. ship는 **컨벤션에 맞는 PR 제목과 브랜치명만** 만든다. `gh` 명령에 `--label`·`--assignee`를 붙이지 않는다.
- **`main` = 프로덕션**. `main` push를 Vercel이 감지해 프로덕션 배포한다. 별도 CD 워크플로우는 없다.

## Preflight

1. `gh auth status` — 인증 실패 시 **중단**.
2. 현재 브랜치 판별:
   - **feature 브랜치** (`<prefix>/...`, `main`·`develop` 아님):
     - 브랜치 prefix에서 타입을 파싱한다.
     - `git log main..HEAD`와 `git diff`로 변경사항 확인 — 커밋도 변경도 없으면 **중단** ("배포할 변경사항이 없습니다").
     - **Phase 3(브랜치 생성)을 스킵**하고 Phase 1로 진행한다 (타입은 브랜치 prefix로 확정).
   - **`main` / `develop`**:
     - `git status --short` — 변경사항이 없으면 **중단** ("배포할 변경사항이 없습니다").
     - 최신 동기화: `git stash push -u -m "ship-preflight-stash"` → `git pull origin <현재브랜치>` → `git stash pop` (충돌 시 충돌 파일을 자체 해결한 뒤 진행).
     - Phase 1로 진행한다 (Phase 3에서 feature 브랜치를 생성).

## Phase 1: 변경사항 분석

> 사용자가 인자로 타입과 설명을 직접 제공한 경우 (예: `ship feat 커서 페이지네이션 추가`), 해당 값을 사용하고 사용자 확인 없이 Phase 2로 직행한다.

1. `git diff`로 변경된 파일과 내용을 분석한다.
2. 변경 성격에 맞는 타입을 결정한다. **라벨 컬럼은 labeler가 자동으로 붙이는 라벨이며 ship가 부여하지 않는다** (제목·브랜치가 컨벤션에 맞으면 자동 적용됨):

   | 타입 | 자동 라벨 | 브랜치 prefix | PR 제목 |
   |------|-----------|---------------|---------|
   | 기능 | `FEAT` | `feat/` | `feat: 설명` |
   | 버그 수정 | `FIX` | `fix/` | `fix: 설명` |
   | 긴급 수정 | `HOTFIX` | `hotfix/` | `hotfix: 설명` |
   | 디자인 | `DESIGN` | `design/` | `design: 설명` |
   | 스타일 | `STYLE` | `style/` | `style: 설명` |
   | 리팩토링 | `REFACTOR` | `refactor/` | `refactor: 설명` |
   | 문서 | `DOCS` | `docs/` | `docs: 설명` |
   | 기타 | `CHORE` | `chore/` | `chore: 설명` |
   | CI | `CI` | `ci/` | `ci: 설명` |

3. 변경 내용을 한 줄로 요약한다.
4. **사용자 확인 대기**:
   ```
   변경사항 요약:
   - 타입: feat
   - 설명: ...
   - 변경 파일: N개

   이대로 배포를 진행할까요? (타입이나 설명을 변경하려면 알려주세요)
   ```

## Phase 2: 검증

CI(`.github/workflows/ci.yml`의 `verify` 잡)와 동일한 게이트를 로컬에서 선검증한다. 순서대로 실행:

1. **타입 검사**: `pnpm exec tsc --noEmit`
2. **린트**: `pnpm lint`
3. **유닛 테스트**: `pnpm test`
4. **빌드**: `pnpm build`

- 하나라도 실패 시 → 실패 내용을 사용자에게 보고하고 **중단**한다 (자동 수정하지 않는다).
- `pnpm install --frozen-lockfile`이 필요한 상태(lockfile 변경 등)면 먼저 설치한다.

## Phase 3: 브랜치 (이슈 생성 없음)

> Preflight에서 이미 feature 브랜치로 진입한 경우 이 Phase를 스킵한다.

1. feature 브랜치 생성: `<prefix>/<설명-슬러그>` → checkout (변경사항은 워킹 트리에 그대로 유지됨).
   - 슬러그는 변경 내용을 나타내는 짧은 **영문 kebab-case**로 만든다 (기존 관행: `fix/planner-example-always-show`). 이슈번호는 붙이지 않는다.
2. 이슈는 생성하지 않는다. 연결할 기존 이슈가 있으면 번호를 기억해 Phase 4의 PR 본문 `Closes #N`에 넣는다.

## Phase 4: 배포

`automation/pipeline.md`를 읽고 해당 절차를 실행한다. Preflight는 스킵하고 Step 1부터 시작한다.
CI·Vercel 체크 대기 폴링은 `automation/pipeline.md`의 「폴링 실행 규칙」에 정의된 **현재 하네스의 폴링 모드**를 따른다 (진입 어댑터가 지정).

전달할 컨텍스트:
- 브랜치명, 타입, 설명 (Phase 1 요약 또는 사용자 인자)
- (선택) 연결 이슈번호

## 규칙

- Phase 1~3에서는 코드를 수정하지 않는다 — 이미 완료된 변경사항을 검증하는 것이 목적이다.
- 빌드 또는 테스트 실패 시 (Phase 2) 자동 수정하지 않고 사용자에게 보고한다.
- **라벨·담당자를 부여하지 않는다** — labeler·auto-assign이 처리한다. ship는 컨벤션 제목·브랜치만 만든다.
- 모든 `gh`/`git` 명령 실패 시 에러 내용을 사용자에게 보고한다.
- PR 생성 시 `.github/PULL_REQUEST_TEMPLATE.md` 형식을 준수한다.
- **민감 파일 커밋 금지**: 배포 과정의 `git add/commit/push`는 `automation/pipeline.md`의 「민감 파일 커밋 금지」 규칙을 따른다.
