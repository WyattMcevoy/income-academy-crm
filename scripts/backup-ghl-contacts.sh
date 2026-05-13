#!/usr/bin/env bash
# Weekly GHL contact backup.
#
# Exports all contacts from GoHighLevel to a timestamped CSV in backups/.
# Retains 12 weeks rolling, older files auto-deleted.
# Sends a completion email to BACKUP_NOTIFY_EMAIL when done.
#
# Schedule with: cron entry → "0 2 * * 0 cd /path/to/repo && ./scripts/backup-ghl-contacts.sh"
# Or run manually: ./scripts/backup-ghl-contacts.sh
#
# Requires env vars in .env (NOT committed):
#   GHL_API_KEY        - GHL Private Integration token
#   GHL_LOCATION_ID    - Income Academy sub-account ID (c3HSS74ILjGye3pvGsHg)
#   BACKUP_NOTIFY_EMAIL - where to send completion notification (optional)

set -euo pipefail

# Load .env if present (don't fail if absent — useful for CI)
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  . .env
  set +a
fi

: "${GHL_API_KEY:?GHL_API_KEY must be set in .env}"
: "${GHL_LOCATION_ID:?GHL_LOCATION_ID must be set in .env}"

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y-%m-%d)
OUTFILE="${BACKUP_DIR}/ghl-contacts-${TIMESTAMP}.csv"
RETAIN_WEEKS=12
RETAIN_DAYS=$((RETAIN_WEEKS * 7))

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting GHL contact backup → ${OUTFILE}"

# CSV header
echo "id,first_name,last_name,email,phone,tags,date_added,date_updated" > "$OUTFILE"

# Paginate through all contacts (GHL caps at 100 per page)
PAGE=1
TOTAL=0
while :; do
  RESPONSE=$(curl -sS -H "Authorization: Bearer ${GHL_API_KEY}" \
    -H "Version: 2021-07-28" \
    "https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100&page=${PAGE}")

  COUNT=$(echo "$RESPONSE" | jq '.contacts | length')

  if [ "$COUNT" -eq 0 ]; then
    break
  fi

  # Flatten each contact to CSV row (jq handles escaping)
  echo "$RESPONSE" | jq -r '.contacts[] | [
    .id,
    .firstName // "",
    .lastName // "",
    .email // "",
    .phone // "",
    (.tags // [] | join("|")),
    .dateAdded // "",
    .dateUpdated // ""
  ] | @csv' >> "$OUTFILE"

  TOTAL=$((TOTAL + COUNT))
  echo "  page ${PAGE}: ${COUNT} contacts (running total: ${TOTAL})"

  if [ "$COUNT" -lt 100 ]; then
    break
  fi

  PAGE=$((PAGE + 1))
done

echo "[$(date)] Backup complete — ${TOTAL} contacts → ${OUTFILE}"

# Retention — delete CSVs older than RETAIN_DAYS
DELETED=$(find "$BACKUP_DIR" -name 'ghl-contacts-*.csv' -mtime +${RETAIN_DAYS} -print -delete | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] Cleaned up ${DELETED} backup(s) older than ${RETAIN_WEEKS} weeks"
fi

# Optional email notification
if [ -n "${BACKUP_NOTIFY_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
  echo "GHL backup completed at $(date). ${TOTAL} contacts saved to ${OUTFILE}." \
    | mail -s "[Income Academy] Weekly GHL backup OK (${TOTAL} contacts)" "$BACKUP_NOTIFY_EMAIL"
fi

# Exit non-zero on suspiciously empty backup (likely API auth fail not caught above)
if [ "$TOTAL" -lt 1 ]; then
  echo "[$(date)] WARNING: 0 contacts backed up. Check GHL_API_KEY and GHL_LOCATION_ID." >&2
  exit 1
fi
