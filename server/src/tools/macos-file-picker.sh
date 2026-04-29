#!/bin/bash
# Drive macOS NSOpenPanel via AppleScript.
# Usage: macos-file-picker.sh /absolute/path/to/file
#
# Caller must have already triggered the file picker in the active app
# (e.g. clicked an "Upload" button in Chrome). This script:
#   1. Brings the file picker to the front
#   2. Sends Cmd+Shift+G (Go To Folder)
#   3. Types the absolute path
#   4. Presses Return twice (navigate, then select)

set -e

FILE_PATH="$1"
if [ -z "$FILE_PATH" ]; then
  echo "Usage: $0 /absolute/path/to/file" >&2
  exit 1
fi
if [ ! -f "$FILE_PATH" ]; then
  echo "File not found: $FILE_PATH" >&2
  exit 1
fi

osascript <<EOF
tell application "System Events"
  delay 0.6
  keystroke "g" using {command down, shift down}
  delay 0.4
  keystroke "$FILE_PATH"
  delay 0.3
  keystroke return
  delay 0.5
  keystroke return
end tell
EOF
