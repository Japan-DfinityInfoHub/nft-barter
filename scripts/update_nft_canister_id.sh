#!/bin/bash

# Update the target NFT (GenerativeArtNFT) canister id.

if [ $# -ne 1 ] ; then
    echo "Usage: $0 <Canister id>" >&2
    exit 1
fi

dfx canister call NFTBarter updateTargetNftCanisterId "(principal \"$1\")"
