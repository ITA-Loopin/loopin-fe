# pipeline — 배포 파이프라인 (하네스 중립 명세)

feature 브랜치의 변경사항을 커밋 → `main` PR → CI·Vercel 체크 → squash 머지 → Vercel 프로덕션 배포까지 자동화한다. `ship`의 Phase 4에서 사용한다.

> **이 파일은 하네스 중립 「진실의 원천」이다.** 각 하네스는 진입 어댑터(`ship`)를 통해 이 절차를 실행하며, 어댑터가 「폴링 실행 규칙」의 모드와 **커밋 Co-Author 트레일러**(Step 1)를 지정한다:
>
> **하네스별 Co-Author 트레일러** (Step 1 커밋 메시지 끝에 붙는 한 줄):
> - Claude Code → `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
> - Codex → `Co-Authored-By: Codex <noreply@openai.com>`
> - Gemini → `Co-Authored-By: Gemini <noreply@google.com>`

**실행 주체**: 전 과정(Step 1~3)을 하나의 실행 흐름이 직접 수행한다.
- **Claude Code**: 메인 세션이 직접 수행하고 서브에이전트에 위임하지 않는다 — 파이프라인은 "액션 → 체크 폴링 → 다음 액션"의 반복인데, 서브에이전트 안에서 백그라운드 폴링을 돌리면 완료 후 재개가 안 돼 대기 지점에서 멈춘다. 메인 세션의 `run_in_background` Bash는 완료 시 세션을 확실히 재호출한다.
- **Codex / Gemini**: 병렬 위임 프리미티브가 없으므로 단일 호출 흐름에서 순차 수행한다.

리포 식별자는 각 Step에서 다음으로 한 번 구한다: `OWNER_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')`.

## 폴링 실행 규칙

CI·Vercel 체크 대기는 모두 **`while` 루프**로 실행한다. 루프의 *실행 모드*(포그라운드/백그라운드)는 진입 어댑터가 지정한 **하네스별 폴링 모드**를 따른다:

| 하네스 | 폴링 모드 |
|--------|-----------|
| **Claude Code** | `run_in_background: true` Bash + `while` 루프. 포그라운드 `sleep` 차단·Monitor 도구 금지(단일 완료 대기에 부적합). 루프 완료 시 세션이 자동 재호출된다. |
| **Codex / Gemini** | 포그라운드 **블로킹** `while` 루프를 **한 번의 셸 호출**로 완료까지 대기. 배경 재호출 프리미티브가 없으므로 루프가 종료 마커를 출력하고 반환할 때까지 그 호출이 블로킹된다. 출력은 파일로 리다이렉트(`> "$LOG" 2>&1`)하고, 루프 내부 `SECONDS` 타임아웃을 상한으로 삼되 **하네스 셸 명령 타임아웃을 루프 상한보다 넉넉히** 설정한다. |

- 루프는 성공·실패·타임아웃 **모든 종료 상태에서 exit**하고, 종료 직전 결과 마커 1줄을 `echo`한다. 출력의 마커·종료코드로 분기한다. 아래 코드 블록의 루프는 모드와 무관하게 동일하게 동작한다.
- 루프 내 GitHub 조회 실패를 pending으로 삼키지 않는다. `gh` 호출 성공 여부를 검사하고, 성공한 반복에서만 `API_ERRORS=0`으로 초기화한다. 실패 stderr는 로그에 남기고, **3회 연속 실패하면 `API_ERROR` 마커를 출력하고 종료**한다. 폴링 간격은 30초 이상이다.
- `API_ERROR`는 체크 실패나 `TIMEOUT`과 구분해 실제 stderr를 요약하고 중단한다. 하네스의 네트워크 권한·DNS·인증 상태를 함께 확인한다.
- **알림이 애매하거나 오래 소식이 없으면 추측·무한 대기 말고 즉시 `gh pr view/checks`로 실제 상태를 확인**한 뒤 분기한다.

## Step 1: 커밋 & PR & 머지 (main)

1. `git status --short` — 커밋 안 된 변경이 있으면 `git diff --cached`로 내용 파악 후 `git add -A` → 커밋 (메시지 끝에 **현재 하네스의 Co-Author 트레일러**를 붙인다). 이미 커밋됐으면 스킵. **커밋 전 「민감 파일 커밋 금지」 규칙을 확인한다.**
2. `git pull origin main --rebase` — 충돌 시 `git rebase --abort` 후 보고하고 중단.
3. `git push --force-with-lease -u origin "<브랜치명>"`
4. `.github/PULL_REQUEST_TEMPLATE.md` placeholder를 채워 `gh pr create --base main --head "<브랜치명>" --title "<type>: <설명>"`:
   - 본문의 각 섹션(작업 내용·변경 사항)을 변경 내용으로 채운다. **스크린샷**은 UI 변경이 있으면 표를 남겨 사람이 첨부하도록 두고, 없으면 항목을 제거한다. **테스트/체크리스트**는 실제 수행한 항목만 체크한다(Phase 2 로컬 검증 통과 항목 포함).
   - 연결 이슈가 있으면 「관련 이슈」에 `Closes #N`을, 없으면 그 섹션을 비운다.
   - **`--label`·`--assignee`를 붙이지 않는다** — labeler·auto-assign이 처리한다.
   - 출력 URL 끝 숫자가 `<PR 번호>`.
5. 머지 게이트 폴링 (30초 간격, 최대 15분) → `MERGE_GATE_DONE` 마커. **게이트 = `mergeable` MERGEABLE + `Vercel`(프리뷰 배포) 성공 + `CI verify` 성공(체크가 존재할 때만)**. `Vercel`은 commit status(`StatusContext`, `.state`)로, CI·나머지는 `CheckRun`(`.conclusion`)으로 올라오므로 `norm()`이 둘 다 정규화한다:
   ```bash
   OWNER_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
   SECONDS=0
   API_ERRORS=0
   while :; do
     if S=$(gh pr view <PR 번호> --json mergeable,statusCheckRollup); then
       API_ERRORS=0
     else
       API_ERRORS=$((API_ERRORS + 1))
       echo "GitHub API query failed ($API_ERRORS/3)"
       if [ "$API_ERRORS" -ge 3 ]; then echo "MERGE_GATE_DONE result=API_ERROR"; break; fi
       sleep 30; continue
     fi
     RESULT=$(echo "$S" | jq -r '
       def norm($x):
         if $x == null then "ABSENT"
         elif $x.__typename == "StatusContext" then
           (if $x.state=="SUCCESS" then "SUCCESS" elif ($x.state=="PENDING" or $x.state=="EXPECTED") then "PENDING" else "FAILURE" end)
         else
           (if $x.status!="COMPLETED" then "PENDING" elif $x.conclusion=="SUCCESS" then "SUCCESS" else "FAILURE" end)
         end;
       (.mergeable) as $m
       # Vercel 프리뷰 배포 (필수). "Vercel Preview Comments"가 아니라 "Vercel"만 본다.
       | norm([.statusCheckRollup[]? | select((.name // .context) == "Vercel")][0]) as $vercel
       # CI verify 잡(ci.yml). main에 없으면 ABSENT → 게이트에서 제외.
       | norm([.statusCheckRollup[]? | select(((.name // .context) // "") | test("typecheck|lint · test"))][0]) as $ci
       | if ($m=="MERGEABLE" and $vercel=="SUCCESS" and ($ci=="SUCCESS" or $ci=="ABSENT")) then "PASS"
         elif ($vercel=="FAILURE" or $ci=="FAILURE" or $m=="CONFLICTING") then "FAIL vercel=\($vercel) ci=\($ci) mergeable=\($m)"
         else "PENDING vercel=\($vercel) ci=\($ci) mergeable=\($m)" end')
     case "$RESULT" in
       PASS)  echo "MERGE_GATE_DONE result=PASS"; break ;;
       FAIL*) echo "MERGE_GATE_DONE result=$RESULT"; break ;;
     esac
     if [ $SECONDS -ge 900 ]; then echo "MERGE_GATE_DONE result=TIMEOUT $RESULT"; break; fi
     sleep 30
   done
   ```
   - `PASS` → `gh pr merge <PR 번호> --squash` (`--auto` 금지).
   - `FAIL` (CI/Vercel 실패) → 실패한 체크의 로그를 요약해 보고하고 중단. `CONFLICTING`·`TIMEOUT`·`API_ERROR`도 각각 요약해 중단.
6. `MERGE_SHA=$(gh pr view <PR 번호> --json mergeCommit --jq '.mergeCommit.oid')`
7. `git checkout main && git pull origin main`
   - `main`이 기본 브랜치이므로 PR 본문의 `Closes #N`은 머지 시 이슈를 **자동으로 닫는다**(연결 이슈가 있는 경우).

## Step 2: Vercel 프로덕션 배포 확인

`main` push(머지)를 Vercel이 감지해 프로덕션 배포를 시작한다. Vercel은 GitHub **Deployment**(`environment=Production`, 생성자 `vercel[bot]`)로 상태를 낸다 — 병합 커밋에는 check-run/commit-status가 붙지 않으므로 Deployments API를 폴링한다.

배포 폴링 (30초 간격, 최대 10분) → `DEPLOY_RESULT` 마커:
```bash
OWNER_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
SECONDS=0
API_ERRORS=0
while :; do
  if DEP=$(gh api "repos/$OWNER_REPO/deployments?sha=$MERGE_SHA&environment=Production" --jq '.[0].id // empty'); then
    API_ERRORS=0
  else
    API_ERRORS=$((API_ERRORS + 1))
    echo "GitHub API query failed ($API_ERRORS/3)"
    if [ "$API_ERRORS" -ge 3 ]; then echo "DEPLOY_RESULT state=API_ERROR"; break; fi
    sleep 30; continue
  fi
  if [ -n "$DEP" ]; then
    STATE=$(gh api "repos/$OWNER_REPO/deployments/$DEP/statuses" --jq '.[0].state // empty')
    case "$STATE" in
      success) echo "DEPLOY_RESULT state=success"; break ;;
      failure|error) echo "DEPLOY_RESULT state=$STATE"; break ;;
    esac
  fi
  if [ $SECONDS -ge 600 ]; then echo "DEPLOY_RESULT state=TIMEOUT"; break; fi
  sleep 30
done
```
- `success` → 배포 완료.
- `failure`·`error` → Vercel 대시보드에서 배포 로그를 확인하도록 안내하고 보고한다. Vercel은 이전 배포로 **즉시 롤백**이 가능하다.
- `TIMEOUT` → 아직 진행 중일 수 있으니 단정하지 말고 대시보드 확인을 안내한다. `API_ERROR` → 루프 stderr를 요약한다.

## Step 3: 정리 & 보고

각 명령이 실패해도 **중단하지 않고 계속 진행**한다(실패 내역만 기록):
1. `git branch -D "<브랜치명>"`
2. `git push origin --delete "<브랜치명>"` (이미 삭제됐으면 무시)
3. 최종 보고: 배포 성공 여부 + 정리 실패 내역(있으면). 배포 성공 + 정리 실패는 파이프라인 실패로 취급하지 않는다.

## 실패 시 재시작 규칙

feature 브랜치와 PR은 재사용한다 — 수정 커밋을 **같은 브랜치에 push**하면 CI·Vercel 체크가 재실행되고 같은 PR이 업데이트된다.

| 실패 시점 | 원인 | 재시작 |
|-----------|------|--------|
| Step 1-5 | CI·Vercel 체크 실패 | 코드 수정 → **Step 1** (같은 브랜치에 새 커밋 push, 게이트 폴링 재개) |
| Step 1-5 | PR 충돌(`CONFLICTING`) | `git pull origin main --rebase`로 해결 → **Step 1** |
| Step 2 | Vercel 프로덕션 배포 실패 | 코드 수정 → **Step 1** (새 커밋 → 새 머지). 필요 시 Vercel 대시보드에서 이전 배포로 롤백 |

## 민감 파일 커밋 금지

`git add/commit/push` 대상에 아래 민감 파일이 포함되지 않도록 커밋 전 확인한다 (기본 이름 및 `<이름>.*` 확장 변형 포함):

- `.env` (및 `.env.local`, `.env.prod` 등 `.env.*`)
- `.claude/settings.local.json`
- `.vercel/` (프로젝트/조직 ID)
- `certs/` 하위 키·인증서, `*.pem`, `*.p12`, `*.key`
- `firebase-adminsdk*.json`
- `id_rsa*`

발견 시 커밋하지 말고 사용자에게 보고한다 — 스테이징돼 있으면 `git reset HEAD <file>`로 해제한다.

> **하네스별 적용**: fe에는 아직 PreToolUse 훅이 없다 — **모든 하네스(Claude Code 포함)가 이 규칙을 LLM이 직접 준수**한다. be식 `.claude/hooks/validate-git-sensitive.sh` 도입은 권장 후속 작업이다. 어느 하네스든 `.gitignore` + GitHub push protection과 병행되는 것을 전제로 한다.

## 규칙

- 모든 `gh`/`git` 실패 시 에러 내용을 사용자에게 보고한다.
- PR 생성 시 `.github/PULL_REQUEST_TEMPLATE.md` 형식을 준수하고, **라벨·담당자는 부여하지 않는다**(Actions 위임).
- **`main` = 프로덕션이다. CI·Vercel 체크 통과 없이 머지하지 않는다.**
- **실패 시 재시작 규칙을 반드시 따른다.**
