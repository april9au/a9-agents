#!/bin/bash
FILE=$(jq -r '.tool_input.file_path // empty')

[[ "$FILE" =~ packages/stack9-stack/src/.*\.json$ ]] || exit 0
[ -f "$FILE" ] || exit 0

yarn workspace stack9-stack validate 2>&1

if [[ "$FILE" =~ /entities/|/query-library/ ]]; then
  yarn generate-models 2>&1
fi
