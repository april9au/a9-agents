#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // empty')

[[ "$FILE" =~ \.(ts|tsx)$ ]] || exit 0
[ -f "$FILE" ] || exit 0

yarn lint 2>&1
yarn typecheck 2>&1
