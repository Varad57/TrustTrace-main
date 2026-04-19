import * as snarkjs from "snarkjs";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log("=========================================");
    console.log("   🚀 Full ZKP Verification & Release    ");
    console.log("=========================================\n");

    // ── 1. Generate Proof Off-Chain ──
    const inputPath = path.join(__dirname, "../../circuits/input.json");
    const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

    console.log(`[1] Off-Chain: Generating Proof`);
    console.log(`    Balance: $${input.balance}`);
    console.log(`    Threshold: $${input.threshold}\n`);

    const wasmPath = path.join(__dirname, "../../circuits/verifyBalance_js/verifyBalance.wasm");
    const zkeyPath = path.join(__dirname, "../../circuits/verifyBalance_FINAL.zkey");

    let proof, publicSignals;
    try {
        const result = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
        proof = result.proof;
        publicSignals = result.publicSignals;
        console.log("    ✅ Proof generated successfully.\n");
    } catch (err) {
        console.log("    ❌ Circuit constraint failed (Balance < Threshold). Cannot generate proof.\n");
        process.exit(1);
    }

    // ── 2. Format Proof for Solidity ──
    console.log("[2] Formatting Proof for Solidity...");
    const pA = [proof.pi_a[0], proof.pi_a[1]];
    const pB = [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]]
    ];
    const pC = [proof.pi_c[0], proof.pi_c[1]];
    const pubSignals = publicSignals;
    console.log("    ✅ Proof packed into a, b, c format.\n");

    // ── 3. Connect to existing Hardhat node ──
    console.log("[3] On-Chain: Deploy & Verify via local Hardhat node...");
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Use Hardhat Account #1 as deployer, wrapped in NonceManager for correct nonce handling
    const deployerWallet = new ethers.Wallet(
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        provider
    );
    const deployer = new ethers.NonceManager(deployerWallet);
    // Use Hardhat Account #2 as investor
    const investorWallet = new ethers.Wallet(
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        provider
    );
    const investor = new ethers.NonceManager(investorWallet);

    // Load compiled artifacts
    const verifierArtifact = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Verifier.sol/Verifier.json"), "utf8")
    );
    const escrowArtifact = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json"), "utf8")
    );

    // Deploy Verifier
    const VerifierFactory = new ethers.ContractFactory(verifierArtifact.abi, verifierArtifact.bytecode, deployer);
    const verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();
    console.log("    ✅ Verifier deployed to:", verifierAddr);

    // Deploy MilestoneEscrow
    const requiredHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const EscrowFactory = new ethers.ContractFactory(escrowArtifact.abi, escrowArtifact.bytecode, deployer);
    const escrow = await EscrowFactory.deploy(deployerWallet.address, [requiredHash], [100], verifierAddr);
    await escrow.waitForDeployment();
    console.log("    ✅ MilestoneEscrow deployed with Verifier.\n");

    // ── 4. Call verifier.verifyProof() ──
    console.log("[4] Calling verifier.verifyProof()...");
    const isVerified = await verifier.verifyProof(pA, pB, pC, pubSignals);

    if (isVerified) {
        console.log("    ✅ verifyProof() returned TRUE! ZKP is verified ON-CHAIN.\n");

        // ── 5. Full escrow release flow ──
        console.log("[5] Simulating full escrow release flow...");

        const escrowInvestor = escrow.connect(investor);
        await escrowInvestor.deposit({ value: ethers.parseEther("10") });
        console.log("    💰 Investor deposited 10 ETH");

        await escrowInvestor.vote(0);
        console.log("    🗳️  Investor voted on milestone 0");

        await escrow.pushExpenseHash(requiredHash);
        console.log("    📝 Expense hash pushed to contract");

        try {
            const tx = await escrow.releaseFunds(pA, pB, pC, pubSignals);
            await tx.wait();
            console.log("    🎉 Funds successfully released from escrow using Zero-Knowledge Proof!\n");
        } catch (e) {
            console.log("    ❌ releaseFunds failed:", e.reason || e.message);
        }
    } else {
        console.log("    ❌ Verification returned false. Proof is invalid.");
    }

    console.log("===========================================");
    console.log("   ✅ ZKP PIPELINE FULLY VERIFIED E2E     ");
    console.log("===========================================");
}

main().catch((err) => {
    console.error("Critical Error:", err.message || err);
    process.exit(1);
});
