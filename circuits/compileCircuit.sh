#!/bin/bash
set -e

echo "=== 1. Compiling Circuit ==="
./circom verifyBalance.circom --r1cs --wasm --sym

echo "=== 2. Creating Groth16 Trusted Setup ==="
if [ ! -f "pot12_final.ptau" ]; then
    echo "Running Powers of Tau..."
    npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
    npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="TrustTrace" -v -e="RandomEntropyHere"
    npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
fi

echo "Generating zkey 0000..."
npx snarkjs groth16 setup verifyBalance.r1cs pot12_final.ptau verifyBalance_0000.zkey
echo "Contributing to zkey (Phase 2)..."
npx snarkjs zkey contribute verifyBalance_0000.zkey verifyBalance_FINAL.zkey --name="1st Contributor" -v -e="random text"
echo "Exporting verification key..."
npx snarkjs zkey export verificationkey verifyBalance_FINAL.zkey verification_key.json

echo "=== 3. Exporting Solidity Verifier ==="
npx snarkjs zkey export solidityverifier verifyBalance_FINAL.zkey ../MilestoneEscrow/contracts/Verifier.sol

echo "✅ Compilation Complete! Verifier.sol generated."
