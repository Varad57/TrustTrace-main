# Hashed Financial Audit Capstone Project

This project natively integrates three advanced architectural blocks into a single verifiable end-to-end blockchain pipeline!
1. **Go High-Throughput Engine**: Asynchronous Go REST backend for sequential SHA-256 hashing.
2. **Ethereum Smart Contract (Hardhat)**: Natively anchors and locks the generated hashes on-chain automatically.
3. **Zero-Knowledge FHE (TenSEAL)**: Uses Homomorphic Encryption internally via a Python Docker container to blindly prove an investor's balance exceeds thresholds proxying securely through the Go backend—all without decrypting the value!

---

## 🛠️ Prerequisites
- **Node.js**: (v22.10.0+ recommended)
- **Go**: (v1.21+)
- **Docker**: (Required for pulling the Python 3.9 image that executes the C++ TenSEAL bindings perfectly on your host environment).

---

## 🚀 Step 1: Spin up the Underlying Services
You will need to ensure the following 3 interconnected background services are actively running in separate terminals.

### Terminal 1: Hardhat Sandbox Node
Launch the local Ethereum EVM test node to open `localhost:8545`.
```bash
cd ./MilestoneEscrow
npx hardhat node
```

### Terminal 2: Go Backend API
Launch the Go REST API and async hashing engine natively on port `8080`.
```bash
cd ./AuditBackend
go build -o server cmd/server/main.go
./server
```

### Terminal 3: TenSEAL Zero-Knowledge Engine
Since TenSEAL requires specific Python dependencies, we've gracefully containerized it with host networking.
Build and run the Docker FHE Engine locally (runs quietly in the background on port `5000`):
```bash
cd ./AuditBackend/tenseal_service
docker build -t tenseal-fhe .
docker run -d --rm --name tenseal_bg --network host tenseal-fhe
```
*(Note: If you already ran the setup prior, `tenseal_bg` might already be running. You can check with `docker ps`)*

---

## ⚡ Step 2: Execute the End-to-End Capstone Sequence
Once the 3 structural services are up and active, you can execute the master orchestration flow seamlessly!

```bash
cd ./
bash e2e_workflow.sh
```

### What does the Orchestrator script mathematically prove?
1. **Go Storage**: Safely logs an active transaction (`POST /expense`) mapping natively to Go's asynchronous ledger.
2. **Hash Retrieval**: Extracts the resulting sequential chronological **SHA-256 Hash Block** immediately via `GET /ledger`.
3. **Smart Contract Linking**: Triggers a local native `ethers.js` script (`push.js`) to dynamically deploy the Solidty contract and permanently anchor that exact `Bytes32` hash purely into the Ethereum EVM state!
4. **FHE Interaction**: Reaches into the Python Docker container (`simulate_client.py`) to connect seamlessly back to the Go Proxy: Encrypting a hidden `$5000` balance, tunneling the execution to securely compute validation against a `$3000` escrow threshold over a blinding protocol, and cleanly decrypting the success token!

---

## 🎤 Demo Script for Judges

To present this dynamically to hackathon judges, follow this guided talking track:

1. **The Core Problem**: Explain that blockchains are transparent but financial audits require privacy. If a startup shows their bank balance on-chain to prove they hit a milestone, competitors can spy on their burn rate.
2. **The Architecture**: 
   - Point to the **Go API** processing transactions asynchronously.
   - Point to the **EVM / Hardhat** terminal anchoring only a mathematical SHA-256 hash (never the raw data) ensuring immutable time-stamping without exposing values.
3. **The "Wow" Factor (Zero-Knowledge / FHE)**:
   - "How do we prove to an investor that a startup has the required funds without showing them the balance?"
   - Run the E2E script (`bash e2e_workflow.sh`) and pause at **Step 4**.
   - Show how the investor encrypted a `$5,000` balance, sent that cipher directly to the smart backend, which evaluated whether it was >= `$3,000` without ever decrypting it, ultimately returning an encrypted 'Success Token' back to the client!
4. **Conclusion**: "By integrating Go for high throughput, Ethereum for indisputable audit hashes, and TenSEAL Fully Homomorphic Encryption for absolute data privacy, we’ve created an escrow release engine that is fully trustless AND completely private."
