import { ethers } from "ethers";
import fs from "fs";

async function main() {
    // Connect to the local Hardhat Node provided by the user
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // First default Hardhat account private key
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const deployer = new ethers.Wallet(privateKey, provider);
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Read the compiled artifact
    const artifactPath = "./artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json";
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Contract artifact not found. Please run 'npx hardhat compile' first.");
    }
    const parsed = JSON.parse(fs.readFileSync(artifactPath));
    const factory = new ethers.ContractFactory(parsed.abi, parsed.bytecode, deployer);

    const referenceHashes = [
      "0xea69cd3b44b8226027c9d968516aa88eff033baf47d95d12224f8d48858e9ab1",
      "0xcf3db6ac80f1d9faac338d6fcb20ac88d7486e92b3a1a9e96e066b1baea318dd",
      "0x8f3cbede41de607c346ac704ea3d537aa252d621b1dbd836ea7aa0a520f924df"
    ];
    const percentages = [20, 30, 50];
    const beneficiary = deployer.address;
    
    console.log("Deploying MilestoneEscrow...");
    const contract = await factory.deploy(beneficiary, referenceHashes, percentages);
    await contract.waitForDeployment();
    
    console.log("MilestoneEscrow deployed successfully to:", await contract.getAddress());
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
