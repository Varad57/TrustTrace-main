import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);

    const verifierArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/Verifier.sol/Groth16Verifier.json")));
    const VerifierFactory = new ethers.ContractFactory(verifierArtifact.abi, verifierArtifact.bytecode, signer);
    const verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();

    const escrowArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json")));
    const EscrowFactory = new ethers.ContractFactory(escrowArtifact.abi, escrowArtifact.bytecode, signer);
    
    const escrow = await EscrowFactory.deploy(
        await signer.getAddress(),
        ["0xea69cd3b44b8226027c9d968516aa88eff033baf47d95d12224f8d48858e9ab1", "0xcf3db6ac80f1d9faac338d6fcb20ac88d7486e92b3a1a9e96e066b1baea318dd", "0x8f3cbede41de607c346ac704ea3d537aa252d621b1dbd836ea7aa0a520f924df"],
        [20, 30, 50],
        verifierAddress
    );

    await escrow.waitForDeployment();
    console.log("Deployed Milestone Escrow: " + await escrow.getAddress());
}

main().catch(console.error);
