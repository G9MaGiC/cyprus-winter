#!/usr/bin/env bash
# Branch cleanup — Cyprus Winter (post PR #199 audit, 2026-08-29).
#
# Categorizes every stale remote branch and cleans it up safely:
#   SAFE      tip is contained in main, or every patch already landed
#             (squash-merged) — deleted after re-verifying at run time
#   PR_HEADS  heads of merged/closed PRs whose content is in main via other
#             commits — deleted; GitHub keeps a "Restore branch" button on
#             the PR (#162 #179 #180 #182 #193 #194 #197)
#   ARCHIVE   old branches carrying unique commits with no PR to restore
#             from — tagged archive/<branch> first, then deleted, so every
#             commit stays reachable (git checkout -b <name> archive/<name>)
#
# Never touches: main, claude/project-overview-gfxf83.
#
# Usage:
#   bash scripts/ops/cleanup-branches.sh            # dry run (default)
#   bash scripts/ops/cleanup-branches.sh --execute  # do it
#
# Requires push access to the repository (run locally, not from a
# branch-scoped CI/agent credential).

set -euo pipefail

EXECUTE=0
[[ "${1:-}" == "--execute" ]] && EXECUTE=1

KEEP_RE='^(main|claude/project-overview-gfxf83)$'

SAFE=(
  codex/release-stability-pwa-20260829
  codex/runtime-hardening-20260829
  cursor/beta-editorial-map-sync-043e
  cursor/beta-legal-i18n-043e
  cursor/beta-locale-graduation-doc-043e
  cursor/beta-plan-funnel-i18n-043e
  cursor/cto-bug-fixes-043e
  cursor/discover-map-first-043e
  cursor/i18n-ci-editorial-drift-043e
  cursor/launch-docs-a84a51a-043e
  cursor/launch-docs-post-168-043e
  cursor/launch-docs-post-170-043e
  cursor/launch-docs-post-172-043e
  cursor/launch-docs-post-174-043e
  cursor/phase-a-token-hygiene-043e
  cursor/phase-b-card-unification-043e
  cursor/phase-c-home-calm-043e
  cursor/phase-d-chrome-tokens-043e
  cursor/phase-e-visual-qa-gate-043e
  cursor/phase-f-photography-trust-043e
  cursor/plan-template-i18n-de-el-pl-043e
  cursor/post-design-launch-hygiene-043e
  cursor/production-origin-align-043e
  cursor/qa-sweep-fixes-043e
  cursor/trail-meta-difficulty-i18n-043e
)

PR_HEADS=(
  codex/fix-production-origin-defaults-20260829 # PR #197 closed, superseded by #198
  cursor/beta-editorial-quality-043e            # PR #182 merged (squash-style)
  cursor/critical-bug-investigation-0b1f        # PR #180 closed, superseded by #191
  cursor/critical-bug-investigation-45ea        # PR #162 closed, superseded by #191
  cursor/cto-runtime-fixes-043e                 # PR #194 closed, superseded by #196
  cursor/fix-dev-refresh-loop-043e              # PR #193 closed, superseded by #195
  cursor/i18n-chrome-batch2-043e                # PR #179 merged (squash-style)
)

ARCHIVE=(
  base/pre-ux-refinement-may16
  chore/add-ci-workflow
  chore/qa-eslint-and-plan-book-stability
  claude/add-claude-documentation-qyf2g
  claude/add-skills-command-7LURB
  claude/code-review-7YOSI
  claude/code-review-78JsJ
  claude/code-review-bB4N7
  claude/code-review-fR1Ur
  claude/enhance-ux-ui-design-NqzLr
  claude/implement-todo-3rRYW
  claude/install-superpowers-plugin-g1Sj0
  claude/run-superpower-plugin-lnRc0
  claude/trio-business-advisor-84qo4
  codex/access-github-repository
  codex/access-github-repository-0ig465
  codex/implement-token-based-email-access-flow
  cursor/beta-locale-chrome-batch5-d4b5
  feat/persona-qa-2026-implementation
  feat/post-review-hardening
  feat/typography-onboarding-locale-session
  feat/ux-refinement-program
  fix/cto-visual-qa-hardening
  fix/discover-trails-booking-maps
  pr/hardening-fixes
  wip/stash-0
)

run() { if [[ $EXECUTE -eq 1 ]]; then "$@"; else echo "  [dry-run] $*"; fi; }

echo "Fetching latest refs…"
git fetch origin --prune --quiet

missing() { ! git show-ref --verify --quiet "refs/remotes/origin/$1"; }
guard_keep() { [[ "$1" =~ $KEEP_RE ]] && { echo "  REFUSING to touch protected branch: $1"; return 0; } || return 1; }

echo; echo "== SAFE (verified merged/patch-equivalent; delete) =="
for b in "${SAFE[@]}"; do
  guard_keep "$b" && continue
  missing "$b" && { echo "  already gone: $b"; continue; }
  if git merge-base --is-ancestor "origin/$b" origin/main \
     || [[ -z "$(git cherry origin/main "origin/$b" | grep '^+' || true)" ]]; then
    run git push origin --delete "$b"
  else
    echo "  SKIP (no longer verifies as merged — inspect manually): $b"
  fi
done

echo; echo "== PR_HEADS (restorable from their PRs; delete) =="
for b in "${PR_HEADS[@]}"; do
  guard_keep "$b" && continue
  missing "$b" && { echo "  already gone: $b"; continue; }
  run git push origin --delete "$b"
done

echo; echo "== ARCHIVE (tag archive/<branch>, then delete) =="
for b in "${ARCHIVE[@]}"; do
  guard_keep "$b" && continue
  missing "$b" && { echo "  already gone: $b"; continue; }
  run git tag -f "archive/$b" "origin/$b"
  run git push origin "refs/tags/archive/$b"
  if [[ $EXECUTE -eq 1 ]]; then
    if git ls-remote --tags origin "archive/$b" | grep -q .; then
      git push origin --delete "$b"
    else
      echo "  SKIP delete (archive tag failed to push): $b"
    fi
  else
    echo "  [dry-run] git push origin --delete $b   # after tag verifies"
  fi
done

echo; echo "Done. Remaining branches:"
git ls-remote --heads origin | awk '{print "  " $2}' | sed 's|refs/heads/||'
[[ $EXECUTE -eq 0 ]] && echo "(dry run — re-run with --execute to apply)"
