#!/usr/bin/env bash
set -euo pipefail

ITERATIONS=5
FEATURE=""
PLAN=""
PRD=""
PROGRESS=""
HITL=false
AFK=false
SANDBOX=false
YOLO=false

usage() {
  cat <<'USAGE'
Usage: ./scripts/ralph.sh [iterations] [--feature=<name>] [--plan=<path>] [--prd=<path>] [--hitl] [--afk] [--sandbox] [--yolo]

Examples:
  ./scripts/ralph.sh --hitl --yolo --feature=registration-api
  ./scripts/ralph.sh 7 --afk --feature=registration-api
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --hitl)
      HITL=true
      ITERATIONS=1
      ;;
    --afk)
      AFK=true
      YOLO=true
      ;;
    --sandbox)
      SANDBOX=true
      ;;
    --yolo)
      YOLO=true
      ;;
    --feature=*)
      FEATURE="${1#*=}"
      ;;
    --plan=*)
      PLAN="${1#*=}"
      ;;
    --prd=*)
      PRD="${1#*=}"
      ;;
    [0-9]*)
      ITERATIONS="$1"
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if [[ -n "$FEATURE" ]]; then
  FEATURE_DIR="docs/features/${FEATURE}"
  if [[ ! -d "$FEATURE_DIR" ]]; then
    echo "Error: feature directory not found: $FEATURE_DIR" >&2
    exit 1
  fi

  [[ -z "$PLAN" ]] && PLAN="${FEATURE_DIR}/plan.json"
  [[ -z "$PRD" && -f "${FEATURE_DIR}/prd.md" ]] && PRD="${FEATURE_DIR}/prd.md"
  [[ -z "$PROGRESS" ]] && PROGRESS="${FEATURE_DIR}/progress.md"
else
  [[ -z "$PLAN" ]] && PLAN="plan.json"
  [[ -z "$PROGRESS" ]] && PROGRESS="progress.md"
fi

if [[ ! -f "$PLAN" ]]; then
  echo "Error: plan file not found: $PLAN" >&2
  exit 1
fi

if [[ ! -f "$PROGRESS" ]]; then
  mkdir -p "$(dirname "$PROGRESS")"
  cat > "$PROGRESS" <<'PROGRESS'
# Ralph Progress Log

Each iteration appends what was done, decisions made, and files changed.
Keep entries concise. This file helps future iterations skip exploration.
PROGRESS
fi

CODEX_FLAGS=(--sandbox workspace-write)
if [[ "$YOLO" == true ]]; then
  CODEX_FLAGS=(--yolo)
fi

PROMPT_FILE="prompts/ralph-iteration.md"
if [[ "$HITL" == true ]]; then
  PROMPT_FILE="prompts/ralph-iteration-hitl.md"
elif [[ "$AFK" == true ]]; then
  PROMPT_FILE="prompts/ralph-iteration-afk.md"
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Error: prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

for ((i=1; i<=ITERATIONS; i++)); do
  echo "=== Ralph iteration ${i}/${ITERATIONS} ==="

  PROMPT="$(cat "$PROMPT_FILE")"
  CONTEXT="@${PLAN} @${PROGRESS}"
  if [[ -n "$PRD" && -f "$PRD" ]]; then
    CONTEXT="@${PRD} ${CONTEXT}"
  fi

  if [[ "$HITL" == true ]]; then
    codex exec "${CODEX_FLAGS[@]}" "$CONTEXT $PROMPT"
    exit 0
  elif [[ "$SANDBOX" == true ]]; then
    result="$(codex exec --sandbox danger-full-access "$CONTEXT $PROMPT" | tee /dev/stderr)"
  else
    result="$(codex exec "${CODEX_FLAGS[@]}" "$CONTEXT $PROMPT" | tee /dev/stderr)"
  fi

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "Plan complete!"
    break
  fi
done

if ! grep -q '"passes"[[:space:]]*:[[:space:]]*false' "$PLAN"; then
  echo "All tasks complete!"
fi
