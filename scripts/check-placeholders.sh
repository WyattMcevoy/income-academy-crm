#!/usr/bin/env bash
# Placeholder guard — fails if launch-blocking placeholder strings still exist
# in marketing/ or docs/. Run as a pre-commit hook AND in CI before deploy.
#
# Usage:
#   ./scripts/check-placeholders.sh          # default scope: marketing/
#   ./scripts/check-placeholders.sh ALL      # scan marketing/ + docs/
#
# Exits 0 if clean, 1 if any placeholder found.

set -euo pipefail

SCOPE="${1:-marketing}"

if [ "$SCOPE" = "ALL" ]; then
  SEARCH_DIRS=(marketing docs)
else
  SEARCH_DIRS=(marketing)
fi

# Strings that MUST NOT be present in shipped marketing pages.
# These are real placeholders from the codebase.
PLACEHOLDERS=(
  "PAYPAL_LINK_PLACEHOLDER"
  "FORM_ID_PLACEHOLDER"
  "GHL_COURSE_URL_"
  "GHL_CHAT_WIDGET_PLACEHOLDER"
  "MARKETING_PREVIEW_PASSWORD"
  "\[BUSINESS_ADDRESS\]"
  "FIXME"
)

FAILED=0

echo "Scanning ${SEARCH_DIRS[*]} for launch-blocking placeholders..."

for placeholder in "${PLACEHOLDERS[@]}"; do
  # -E for extended regex (escapes work), -n for line numbers, -r recursive
  MATCHES=$(grep -rnE "$placeholder" "${SEARCH_DIRS[@]}" \
    --include="*.html" --include="*.md" --include="*.js" --include="*.ts" \
    2>/dev/null || true)

  if [ -n "$MATCHES" ]; then
    echo ""
    echo "❌ Placeholder \"$placeholder\" still present:"
    echo "$MATCHES" | sed 's/^/   /'
    FAILED=1
  fi
done

echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ No launch-blocking placeholders found in: ${SEARCH_DIRS[*]}"
  exit 0
else
  echo "❌ Fix the placeholders above before deploying."
  echo ""
  echo "Reference docs for replacing each:"
  echo "  PAYPAL_LINK_PLACEHOLDER → docs/paypal-setup.md"
  echo "  FORM_ID_PLACEHOLDER     → docs/ebay-apply-setup.md"
  echo "  GHL_COURSE_URL_*        → docs/ghl-upload-guide.md"
  echo "  [BUSINESS_ADDRESS]      → docs/pre-launch-checklist.md (Tier 1, Legal entity)"
  exit 1
fi
