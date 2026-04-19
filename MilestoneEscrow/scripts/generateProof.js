import * as snarkjs from "snarkjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log("=== ZKP Proof Generation === ");
    
    // Read input payload
    const inputPath = path.join(__dirname, "../../circuits/input.json");
    if (!fs.existsSync(inputPath)) {
        console.error("❌ circuits/input.json not found!");
        process.exit(1);
    }
    
    const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    console.log(`Generating proof for Balance: ${input.balance} vs Threshold: ${input.threshold}...`);

    const wasmPath = path.join(__dirname, "../../circuits/verifyBalance_js/verifyBalance.wasm");
    const zkeyPath = path.join(__dirname, "../../circuits/verifyBalance_FINAL.zkey");

    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        console.error("❌ WASM or ZKEY missing! Ensure you compiled circuits.");
        process.exit(1);
    }

    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
        console.log("✅ Proof generated successfully!");
        
        fs.writeFileSync(path.join(__dirname, "../proof.json"), JSON.stringify(proof, null, 2));
        fs.writeFileSync(path.join(__dirname, "../public.json"), JSON.stringify(publicSignals, null, 2));
        console.log("Saved proof.json and public.json to MilestoneEscrow/");

        // Print example formatted proof for solidity
        const calldataCall = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        console.log("\n✅ Example Formatted Proof for Solidity:");
        console.log("-----------------------------------------");
        console.log(calldataCall);
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("❌ Proof generation failed:", err);
    }
}

main().catch(console.error);
