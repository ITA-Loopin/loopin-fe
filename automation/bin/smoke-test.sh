#!/usr/bin/env bash
# automation/bin 게이트 스크립트 스모크 테스트 — CI(scripts 잡)와 로컬에서 동일하게 실행한다.
# 핵심 검증 대상 셋: (1) fail-closed 성질 — git 조회 실패가 통과(SKIP/PASS)로 새지 않고
# ERROR(비 0 종료)로 끝나는지, (2) merge-gate.jq 판정 로직 — fixture JSON으로 게이트 규칙을 검증,
# (3) 민감 파일 훅(.claude/hooks) — 하네스 stdin JSON으로 deny가 나오는지.
# eslint·gh 호출이 필요 없는 경로만 검사한다. 의존성은 git·jq뿐이다(둘 다 ubuntu 러너 기본 설치).
# 종료 마커: SMOKE result=PASS|FAIL
set -u

BIN=$(cd "$(dirname "$0")" && pwd) || exit 1
command -v jq >/dev/null 2>&1 \
  || { echo "jq가 필요합니다 (merge-gate 판정 테스트)"; echo "SMOKE result=FAIL"; exit 1; }
FAILED=0

# check <설명> <기대 종료코드> <기대 마커> <명령...>
check() {
  local desc=$1 want_rc=$2 want_marker=$3
  shift 3
  local out rc
  out=$("$@" 2>&1)
  rc=$?
  if [ "$rc" -ne "$want_rc" ] || ! grep -q "$want_marker" <<<"$out"; then
    echo "FAIL: $desc (rc=$rc, 기대 rc=$want_rc, 기대 마커 '$want_marker')"
    # 여러 줄 들여쓰기는 sed가 더 명확하다
    # shellcheck disable=SC2001
    sed 's/^/  | /' <<<"$out"
    FAILED=1
  else
    echo "ok: $desc"
  fi
}

# hook_check <설명> <기대: deny|pass> <command 문자열> — 훅에 하네스(Claude Code·Codex)가 주는 stdin JSON을 흘려 판정한다
HOOK="$BIN/../../.claude/hooks/validate-git-sensitive.sh"
hook_check() {
  local desc=$1 want=$2 cmd=$3
  local out rc
  out=$(jq -cn --arg c "$cmd" '{tool_name:"Bash",tool_input:{command:$c}}' | "$HOOK" 2>&1)
  rc=$?
  local got="pass"
  grep -q '"permissionDecision": "deny"' <<<"$out" && got="deny"
  if [ "$rc" -ne 0 ] || [ "$got" != "$want" ]; then
    echo "FAIL: $desc (rc=$rc, 판정=$got, 기대=$want)"
    # shellcheck disable=SC2001
    sed 's/^/  | /' <<<"$out"
    FAILED=1
  else
    echo "ok: $desc"
  fi
}

# 스크래치 리포 — 사용자 리포의 인덱스·워킹트리를 건드리지 않는다.
TMP=$(mktemp -d) || exit 1
trap 'rm -rf "$TMP"' EXIT
git -C "$TMP" init -q
echo hi > "$TMP/note.txt"
git -C "$TMP" add note.txt
git -C "$TMP" -c user.email=smoke@test -c user.name=smoke commit -qm init
cd "$TMP" || exit 1

check "lint-changed: 빈 diff → SKIP" \
  0 "LINT_CHANGED result=SKIP" "$BIN/lint-changed.sh" HEAD HEAD
check "lint-changed: 잘못된 SHA → ERROR (fail-closed)" \
  1 "LINT_CHANGED result=ERROR" "$BIN/lint-changed.sh" deadbeef cafebabe
check "lint-changed: origin/main 부재(로컬 모드) → ERROR (fail-closed)" \
  1 "LINT_CHANGED result=ERROR" "$BIN/lint-changed.sh"
check "lint-changed: 인자 1개 → usage 에러" \
  2 "usage" "$BIN/lint-changed.sh" onearg

check "sensitive-gate: 민감 파일 없음 → PASS" \
  0 "SENSITIVE_GATE result=PASS" "$BIN/sensitive-gate.sh"
echo secret > .env
git add -f .env
check "sensitive-gate: .env 스테이징 → BLOCKED" \
  1 "SENSITIVE_GATE result=BLOCKED" "$BIN/sensitive-gate.sh"
git reset -q HEAD .env
echo key > AuthKey_test.p8
git add -f AuthKey_test.p8
check "sensitive-gate: *.p8 스테이징 → BLOCKED" \
  1 "SENSITIVE_GATE result=BLOCKED" "$BIN/sensitive-gate.sh"
git reset -q HEAD AuthKey_test.p8
check "sensitive-gate: git 실패 → ERROR (fail-closed)" \
  1 "SENSITIVE_GATE result=ERROR" env GIT_DIR=/nonexistent "$BIN/sensitive-gate.sh"

# --- 훅 (.claude/hooks/validate-git-sensitive.sh) — 하네스 stdin JSON을 모사해 deny/pass를 판정한다.
# 핵심은 명시 인자 파싱이 광역 판정으로 새지 않는 것이다 — macOS sed는 \b를 몰라 원본 훅이 그랬고,
# 그 결과 `git add -f .env`(ignored 민감 파일 강제 추가)가 통과했다.
# 위 sensitive-gate 테스트가 남긴 untracked 파일을 치워 판정 대상을 .env 하나로 고정한다.
rm -f AuthKey_test.p8
echo secret > .env
hook_check "hook: git 외 명령은 통과" pass "pnpm build"
hook_check "hook: git status는 통과" pass "git status --short"
hook_check "hook: git add .env → deny" deny "git add .env"
hook_check "hook: git add -A (광역) → untracked .env 감지 → deny" deny "git add -A && git commit -m x"
hook_check "hook: git add note.txt (명시·비민감) → 통과" pass "git add note.txt"
git add -f .env
hook_check "hook: .env 스테이징 상태의 git commit → deny" deny "git commit -m 'x'"
git reset -q HEAD .env
hook_check "hook: 스테이징 해제 후 git commit → 통과" pass "git commit -m 'x'"
printf '.env*\n' > .gitignore
hook_check "hook: ignored 민감 파일을 git add -f <파일>로 명시 → deny (명시 인자 파싱)" deny "git add -f .env"
hook_check "hook: ignored 민감 파일 + git add -A -f (광역 강제) → deny" deny "git add -A -f"
hook_check "hook: git add . (광역, 민감 파일은 ignored) → 통과 (git도 ignored는 add하지 않는다)" pass "git add ."
hook_check "hook: git add -f note.txt (강제지만 명시·비민감) → 통과" pass "git add -f note.txt"
hook_check "hook: git add -- .env (옵션 종료 뒤 명시) → deny" deny "git add -- .env"
rm -f .gitignore .env

# --- merge-gate.jq 판정 fixture 테스트 (gh 없이 게이트 규칙 자체를 검증)
GATE_JQ="$BIN/merge-gate.jq"
CHECKRUN_OK='{"__typename":"CheckRun","name":"typecheck · test · build","status":"COMPLETED","conclusion":"SUCCESS"}'
VERCEL_OK='{"__typename":"StatusContext","context":"Vercel","state":"SUCCESS"}'

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[%s,%s]}' \
  "$CHECKRUN_OK" "$VERCEL_OK" > fixture.json
check "merge-gate.jq: 전부 성공 → PASS" \
  0 "^PASS$" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[{"__typename":"CheckRun","name":"typecheck · test · build","status":"COMPLETED","conclusion":"FAILURE"},%s]}' \
  "$VERCEL_OK" > fixture.json
check "merge-gate.jq: 체크 실패 → FAIL failed=" \
  0 "^FAIL failed=typecheck" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[%s]}' \
  "$CHECKRUN_OK" > fixture.json
check "merge-gate.jq: Vercel 부재 → PENDING (vacuous pass 방지)" \
  0 "^PENDING vercel=ABSENT" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[%s]}' \
  "$VERCEL_OK" > fixture.json
check "merge-gate.jq: Vercel만 있고 CI 미등록 → PENDING (조기 vacuous pass 방지)" \
  0 "^PENDING" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[%s,%s,{"__typename":"StatusContext","context":"Vercel Preview Comments","state":"FAILURE"}]}' \
  "$CHECKRUN_OK" "$VERCEL_OK" > fixture.json
check "merge-gate.jq: 비차단 예외 실패는 무시 → PASS" \
  0 "^PASS$" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"CONFLICTING","statusCheckRollup":[%s,%s]}' \
  "$CHECKRUN_OK" "$VERCEL_OK" > fixture.json
check "merge-gate.jq: 충돌 → FAIL mergeable=CONFLICTING" \
  0 "mergeable=CONFLICTING" jq -r -f "$GATE_JQ" fixture.json

printf '{"mergeable":"MERGEABLE","statusCheckRollup":[]}' > fixture.json
check "merge-gate.jq: 체크 0개 → PENDING (vacuous pass 방지)" \
  0 "^PENDING" jq -r -f "$GATE_JQ" fixture.json

if [ "$FAILED" -ne 0 ]; then
  echo "SMOKE result=FAIL"
  exit 1
fi
echo "SMOKE result=PASS"
