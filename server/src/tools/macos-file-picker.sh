#!/bin/bash
# Drive macOS NSOpenPanel via AppleScript.
# Usage: macos-file-picker.sh /absolute/path/to/file
#
# Caller must have already triggered the file picker in the active app
# (e.g. clicked an "Upload" button in Chrome). This script:
#   1. Activates the System Events context
#   2. Sends Cmd+Shift+G (Go To Folder)
#   3. Types the absolute path
#   4. Presses Return (key code 36) to navigate to the folder + accept the file
#
# Uses key code 36 for Return (layout-independent) instead of `keystroke return`,
# which on some layouts has been observed to type a stray "/".

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

# Wait a beat for the picker to be fully ready before we start typing.
sleep 1.2

osascript <<EOF
tell application "System Events"
  -- Open the "Go to folder" sheet
  keystroke "g" using {command down, shift down}
  delay 0.7
  -- Type the full absolute path
  keystroke "$FILE_PATH"
  delay 0.5
  -- Press Return (key code 36) to navigate + select
  key code 36
  delay 0.8
  -- Press Return again to click "Open"
  key code 36
end tell
EOF
