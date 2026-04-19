import { ethers } from "ethers";
import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log("=== 1. ZKP Proof Generation ===");
    const inputPath = path.join(__dirname, "../input.json");
    const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    
    const wasmPath = path.join(__dirname, "../../circuits/verifyBalance_js/verifyBalance.wasm");
    const zkeyPath = path.join(__dirname, "../../circuits/verifyBalance_FINAL.zkey");

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    console.log("✅ Proof computed off-chain.");

    const calldataBlob = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldataBlob.replace(/["[\]\s]/g, "").split(",");
    
    const a = [argv[0], argv[1]];
    const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]]
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    console.log("=== 2. On-Chain Verification & Release ===");
    const artifactPath = path.join(__dirname, "../artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);

    const contractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; 
    const escrow = new ethers.Contract(contractAddress, artifact.abi, signer);

    console.log(`Checking Eligibility for investor...`);
    const isEligible = await escrow.verifyEligibility(a, b, c, Input);
    console.log(`Smart Contract Response: ${isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`);

    if (isEligible) {
        console.log("Triggering Release...");
        try {
            const tx = await escrow.releaseFunds(a, b, c, Input);
            await tx.wait();
            console.log("✅ Milestone Funds successfully released!");
        } catch (e) {
            console.error("❌ Failed to release:", e.message);
        }
    } else {
        console.log("Release aborted: Proof marked invalid by Verifier contract.");
    }
}

main().catch(console.error);
