#!/bin/bash
# Copy a lesson's HTML directly to the macOS clipboard.
#
# Usage: copy-lesson.sh <course> <module-number>
#   course: ai | affiliate | estate | bookkeeping
#   module-number: 0 through 8
#
# Example:
#   copy-lesson.sh ai 1     # Copies AI Side Income Module 1 to clipboard
#   copy-lesson.sh affiliate 4
#
# After running, paste in GHL Custom Code Editor with Cmd+V.

set -e

COURSE="$1"
MODULE="$2"

if [ -z "$COURSE" ] || [ -z "$MODULE" ]; then
  echo "Usage: copy-lesson.sh <course> <module-number>"
  echo "  course: ai | affiliate | estate | bookkeeping"
  echo "  module: 0-8"
  exit 1
fi

# Map shorthand to full course folder names
case "$COURSE" in
  ai|aiside)         FOLDER="ai-side-income" ;;
  affiliate|aff)     FOLDER="affiliate-marketing" ;;
  estate|estatesale) FOLDER="estate-sale-sourcing" ;;
  bookkeeping|book)  FOLDER="bookkeeping-from-home" ;;
  *)
    echo "Unknown course: $COURSE"
    echo "Use: ai | affiliate | estate | bookkeeping"
    exit 1
    ;;
esac

# Pad module number to 2 digits (0 -> 00)
PADDED=$(printf "%02d" "$MODULE")

# Find the matching HTML file
HTML_DIR="/Users/wyattsmac/Documents/Income Academy CRM/docs/courses/$FOLDER/lessons-html"
HTML_FILE=$(find "$HTML_DIR" -name "module-${PADDED}-*.html" | head -1)

if [ -z "$HTML_FILE" ] || [ ! -f "$HTML_FILE" ]; then
  echo "No HTML file found for course=$COURSE module=$MODULE"
  echo "Looked in: $HTML_DIR"
  echo ""
  echo "Available modules in this course:"
  ls "$HTML_DIR" 2>/dev/null | sed 's/^/  /'
  exit 1
fi

# Copy to clipboard
cat "$HTML_FILE" | pbcopy

CHARS=$(pbpaste | wc -c | xargs)
echo "[OK] Copied $CHARS chars to clipboard"
echo "  File: $(basename "$HTML_FILE")"
echo ""
echo "Now in GHL:"
echo "  1. Open the matching lesson editor"
echo "  2. Click the < > 'Custom Code Editor' button"
echo "  3. Click inside the code area, Cmd+A, Cmd+V"
echo "  4. Click Save (modal)"
echo "  5. Click Save & Publish (lesson)"
