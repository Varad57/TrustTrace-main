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
cd /home/varad/Projects/MVPBC/MilestoneEscrow
npx hardhat node
```

### Terminal 2: Go Backend API
Launch the Go REST API and async hashing engine natively on port `8080`.
```bash
cd /home/varad/Projects/MVPBC/AuditBackend
go build -o server cmd/server/main.go
./server
```

### Terminal 3: TenSEAL Zero-Knowledge Engine
Since TenSEAL requires specific Python dependencies, we've gracefully containerized it with host networking.
Build and run the Docker FHE Engine locally (runs quietly in the background on port `5000`):
```bash
cd /home/varad/Projects/MVPBC/AuditBackend/tenseal_service
docker build -t tenseal-fhe .
docker run -d --rm --name tenseal_bg --network host tenseal-fhe
```
*(Note: If you already ran the setup prior, `tenseal_bg` might already be running. You can check with `docker ps`)*

---

## ⚡ Step 2: Execute the End-to-End Capstone Sequence
Once the 3 structural services are up and active, you can execute the master orchestration flow seamlessly!

```bash
cd /home/varad/Projects/MVPBC
bash e2e_workflow.sh
```

### What does the Orchestrator script mathematically prove?
1. **Go Storage**: Safely logs an active transaction (`POST /expense`) mapping natively to Go's asynchronous ledger.
2. **Hash Retrieval**: Extracts the resulting sequential chronological **SHA-256 Hash Block** immediately via `GET /ledger`.
3. **Smart Contract Linking**: Triggers a local native `ethers.js` script (`push.js`) to dynamically deploy the Solidty contract and permanently anchor that exact `Bytes32` hash purely into the Ethereum EVM state!
4. **FHE Interaction**: Reaches into the Python Docker container (`simulate_client.py`) to connect seamlessly back to the Go Proxy: Encrypting a hidden `$5000` balance, tunneling the execution to securely compute validation against a `$3000` escrow threshold over a blinding protocol, and cleanly decrypting the success token!
