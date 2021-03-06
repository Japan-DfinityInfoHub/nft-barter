#!/bin/bash

# Motoko type check script

set -eu

MOTOKO_DIR=src/NFTBarter

for i in $(find ${MOTOKO_DIR} -name '*.mo'); do
    echo ==== Run Motoko type check: ${i} ====
    $(dfx cache show)/moc $(vessel sources) --check $i
done

echo "SUCCEED: All Motoko type check passed"
exit 0
