#!/bin/bash
set -e

echo "=== Step 1: Expense Logged to Go Backend ==="
curl -s -X POST http://127.0.0.1:8080/expense -H "Content-Type: application/json" -d '{"description": "E2E Server Hardware", "amount": 1200.00}' > /dev/null
echo "Expense Logged via JSON API."

echo -e "\n=== Step 2: Hash stored in DB (Memory Queue) ==="
sleep 0.5
LATEST_HASH=$(curl -s http://127.0.0.1:8080/ledger | grep -o '"currentHash":"[^"]*"' | tail -1 | cut -d '"' -f 4)
if [ -z "$LATEST_HASH" ]; then
    echo "Error: Could not retrieve hash."
    exit 1
fi
echo "Retrieved SHA-256 Hash from Go Engine: $LATEST_HASH"

echo -e "\n=== Step 3: Hash Pushed to Blockchain ==="
cd "$(dirname "$0")/MilestoneEscrow"
npx hardhat compile > /dev/null
cd raw_e2e
export LATEST_HASH=$LATEST_HASH
node push.js

echo -e "\n=== Step 4: FHE Verifies Investor Eligibility ==="
docker exec tenseal_bg python simulate_client.py

echo -e "\n=============================================="
echo "    CAPSTONE E2E INTEGRATION COMPLETED!    "
echo "=============================================="
