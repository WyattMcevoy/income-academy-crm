#!/bin/bash
# Drive macOS NSOpenPanel via AppleScript.
# Usage: macos-file-picker.sh /absolute/path/to/file
#
# Caller must have ALREADY clicked an "Upload" button in Chrome that
# opens the file picker. This script then:
#   1. Activates Google Chrome (so keystrokes go to its dialog, not Claude)
#   2. Waits for the picker to be ready
#   3. Sends Cmd+Shift+G (Go To Folder)
#   4. Types the absolute path
#   5. Presses Return (key code 36) twice — navigate + open
#
# Uses key code 36 for Return (layout-independent) instead of `keystroke return`
# to avoid layout-dependent quirks where Return was interpreted as '/' on
# some macOS keyboard layouts.

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
-- Bring Chrome (and its file picker) to the front BEFORE any keystrokes.
tell application "Google Chrome" to activate
delay 1.5

tell application "System Events"
  -- Verify Chrome is frontmost; if not, AppleScript would type into the wrong app.
  set frontApp to name of first application process whose frontmost is true
  if frontApp is not "Google Chrome" then
    error "Front app is '" & frontApp & "', not Google Chrome — aborting"
  end if

  -- Open the "Go to folder" sheet
  keystroke "g" using {command down, shift down}
  delay 0.7

  -- Type the full absolute path
  keystroke "$FILE_PATH"
  delay 0.5

  -- Press Return to navigate to the file
  key code 36
  delay 1.0

  -- Press Return again to click "Open" / accept the selection
  key code 36
end tell
EOF
