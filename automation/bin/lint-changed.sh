#!/usr/bin/env bash
# 변경 파일 한정 lint (ratchet) — CI(lint-changed 잡)와 로컬 선검증(ship Phase 2 게이트 B)이
# 공유하는 단일 구현이다. 대상 산출·실행 로직을 바꾸려면 이 파일만 고친다.
#
# 사용법:
#   lint-changed.sh <BASE_SHA> <HEAD_SHA>   # CI 모드: 3-dot diff(merge-base..head)가 추가/수정한 파일만
#   lint-changed.sh                         # 로컬 모드: origin/main 대비 커밋 + 워킹트리 + untracked
#                                           #   (사전에 git fetch origin main 필요)
#
# 무인자 eslint는 전체 검사되어 기존 lint 부채에 막히므로, 반드시 파일 인자를 넘겨 실행한다.
# error는 종료코드 1로 차단, warning은 통과(eslint 기본 동작).
# 게이트는 fail-closed다 — git 조회가 실패하면 빈 목록(통과)이 아니라 ERROR로 종료한다.
# 종료 마커: LINT_CHANGED result=SKIP|PASS|FAIL|ERROR
set -u

if [ $# -eq 2 ]; then
  RAW=$(git diff --name-only --diff-filter=ACMR "$1...$2") \
    || { echo "LINT_CHANGED result=ERROR"; exit 1; }
elif [ $# -eq 0 ]; then
  # origin/main 부재 등 git 조회 실패는 fail-closed(ERROR)로 끝낸다. 각 명령의 종료 상태를
  # 개별로 확인한다 — `$(set -e; ...)` 명령 치환은 bash 버전에 따라 중간 실패를 삼켜(fail-open)
  # SKIP으로 새므로(로컬 bash 3.2는 잡지만 CI bash 5.x는 놓친다) 쓰지 않는다.
  git rev-parse --verify --quiet origin/main >/dev/null \
    || { echo "LINT_CHANGED result=ERROR"; exit 1; }
  d1=$(git diff --name-only --diff-filter=ACMR origin/main...HEAD) \
    || { echo "LINT_CHANGED result=ERROR"; exit 1; }
  d2=$(git diff --name-only --diff-filter=ACMR HEAD) \
    || { echo "LINT_CHANGED result=ERROR"; exit 1; }
  d3=$(git ls-files --others --exclude-standard) \
    || { echo "LINT_CHANGED result=ERROR"; exit 1; }
  RAW=$(printf '%s\n%s\n%s\n' "$d1" "$d2" "$d3")
else
  echo "usage: $0 [<BASE_SHA> <HEAD_SHA>]" >&2
  exit 2
fi

# lint 가능한 확장자만 고르고, 목록에 남은 삭제·이동 파일이 eslint 인자로 들어가지 않게 [ -f ]로 거른다.
FILES=()
while IFS= read -r f; do
  [ -f "$f" ] && FILES+=("$f")
done < <(printf '%s\n' "$RAW" | grep -E '\.[mc]?[jt]sx?$' | sort -u)

if [ ${#FILES[@]} -eq 0 ]; then
  echo "변경된 lint 대상 파일이 없어 건너뜁니다."
  echo "LINT_CHANGED result=SKIP"
  exit 0
fi

echo "대상 파일 (${#FILES[@]}건):"
printf '  %s\n' "${FILES[@]}"

if pnpm exec eslint "${FILES[@]}"; then
  echo "LINT_CHANGED result=PASS"
else
  echo "LINT_CHANGED result=FAIL"
  exit 1
fi
