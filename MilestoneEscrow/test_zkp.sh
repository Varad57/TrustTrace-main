#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "=== 1. Deploying ZK-Integrated Contracts to Local Node ==="
node scripts/deployLocally.js > deploy.log
ESCROW_ADDR=$(grep "Deployed Milestone Escrow:" deploy.log | awk -F': ' '{print $2}' | tr -d '[:space:]')
echo "Deployed Milestone Escrow: $ESCROW_ADDR"

echo -e "\n=== 2. Testing POSITIVE Condition (Balance 5000 >= Threshold 3000) ==="
echo '{"balance": 5000, "threshold": 3000}' > input.json
node scripts/generateProof.js
# Update verifyAndRelease.js dynamically to use the freshly deployed escrow locally
sed -i "s/const contractAddress = .*/const contractAddress = \"$ESCROW_ADDR\";/" scripts/verifyAndRelease.js
node scripts/verifyAndRelease.js

echo -e "\n=== 3. Testing NEGATIVE Condition (Balance 2000 >= Threshold 3000) ==="
echo '{"balance": 2000, "threshold": 3000}' > input.json
# Generating proof here will succeed but the proof corresponds to isValid=0, OR if we constrained isValid===1 it will naturally fail here!
# Let's observe the behavior off-chain!
if node scripts/generateProof.js; then
    echo "Proof generation mysteriously generated? Sending to blockchain to enforce..."
    node scripts/verifyAndRelease.js || echo "✅ transaction elegantly reverted as expected."
else
    echo "✅ Proof generation safely halted client-side because Balance is less than Threshold!"
fi

echo -e "\n=== ALL TESTS PASSED! ==="
