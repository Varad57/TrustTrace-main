# TrustTrace: Hashed Financial Audit Platform

This project natively integrates four advanced architectural blocks into a single verifiable end-to-end blockchain pipeline!

1. **Frontend (React + Vite)**: High-performance, modern user interface.
2. **Go High-Throughput Engine**: Asynchronous Go REST backend for sequential SHA-256 hashing.
3. **Ethereum Smart Contract (Hardhat)**: Natively anchors and locks the generated hashes on-chain automatically.
4. **Zero-Knowledge Proofs (Circom + SnarkJS)**: A fully trustless ZKP system that verifies investor solvency OFF-CHAIN and proves it ON-CHAIN, removing any reliance on python simulations.

---

## 🛠️ Prerequisites
- **Node.js**: (v22.10.0+ recommended)
- **Go**: (v1.21+)
- **Circom**: Optionally installed for compiling `.circom` manually, though compiled artifacts and WASM bindings run via Node effortlessly!

---

## 🚀 Step 1: Spin up the Underlying Services

You will need to ensure the interconnected background services and frontend are running.

### Service 1: Hardhat Sandbox Node
Launch the local Ethereum EVM test node to open `localhost:8545`.
```bash
cd ./MilestoneEscrow
npm install
npx hardhat node
```

### Service 2: Go Backend API
Launch the Go REST API and async hashing engine natively on port `8080`.
```bash
cd ./AuditBackend
go run cmd/server/main.go
# Or build it: go build -o server cmd/server/main.go && ./server
```

### Service 3: Frontend Web App
Launch the React application for the user interface.
```bash
cd ./frontend
npm install
npm run dev
```

### Service 4: ZKP Setup & Compilation
You can rebuild the circuits and regenerate trust keys entirely using SnarkJS!
```bash
cd ./circuits
./compileCircuit.sh
```

---

## ⚡ Step 2: Execute the End-to-End Capstone Sequence

Once the Go backend and Hardhat node are up and active, you can execute the master orchestration flow seamlessly!

```bash
cd ./
bash e2e_workflow.sh
```

### What does the Orchestrator script mathematically prove?
1. **Go Storage**: Safely logs an active transaction (`POST /expense`) mapping natively to Go's asynchronous ledger.
2. **Hash Retrieval**: Extracts the resulting sequential chronological **SHA-256 Hash Block** immediately via `GET /ledger`.
3. **Smart Contract Linking**: Triggers a local native `ethers.js` script (`push.js`) to dynamically deploy the Solidity contract and permanently anchor that exact `Bytes32` hash purely into the Ethereum EVM state!
4. **Trustless ZKP Interaction**: Triggers `zkp_flow.js` where the user generates a mathematically valid Groth16 SnarkJS Proof off-chain showing they hit the `balance >= threshold` mark. This outputs formatted inputs directly into the smart contract's `releaseFunds()` function ensuring pure on-chain Solidity Verification!

---

## 🎤 ZKP Example IO
**input.json**:
```json
{
  "balance": "5000",
  "threshold": "3000"
}
```

## 🎤 Demo Script for Judges

To present this dynamically to hackathon judges, follow this guided talking track:

1. **The Core Problem**: Explain that blockchains are transparent but financial audits require privacy. If a startup shows their bank balance on-chain to prove they hit a milestone, competitors can spy on their burn rate.
2. **The Architecture**: 
   - Point to the **React Frontend** providing a seamless experience.
   - Point to the **Go API** processing transactions asynchronously.
   - Point to the **EVM / Hardhat** terminal anchoring only a mathematical SHA-256 hash (never the raw data) ensuring immutable time-stamping without exposing values.
3. **The "Wow" Factor (Zero-Knowledge / ZKP)**:
   - "How do we prove to an investor that a startup has the required funds without showing them the balance?"
   - Run the E2E script (`bash e2e_workflow.sh`) and pause at **Step 4**.
   - Show how the investor generated a Groth16 SNARK proof off-chain using Circom and injected only mathematical witness tokens directly into an EVM Smart Contract Verifier without revealing their balance!
4. **Conclusion**: "By integrating Go for high throughput, Ethereum for indisputable audit hashes, and Circom ZK Proofs for on-chain trustless verification, we’ve created an escrow release engine that is fully trustless AND completely private."
