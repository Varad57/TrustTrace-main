import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log("=== 🚀 ZKP Contract Deployment ===");

    // 1. Deploy Verifier
    const Verifier = await hre.ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    
    const verifierAddress = await verifier.getAddress();
    console.log("✅ Verifier deployed to:", verifierAddress);

    // 2. Deploy MilestoneEscrow
    const [deployer] = await hre.ethers.getSigners();
    
    const beneficiary = deployer.address;
    const refHashes = [
        "0xf221d60ea47f52edb5695a4358a5daff6c7ab9bb6f5fbca0236a263884e90d0b"
    ];
    const percentages = [100];
    
    const MilestoneEscrow = await hre.ethers.getContractFactory("MilestoneEscrow");
    const escrow = await MilestoneEscrow.deploy(beneficiary, refHashes, percentages, verifierAddress);
    await escrow.waitForDeployment();

    const escrowAddress = await escrow.getAddress();
    console.log("✅ MilestoneEscrow deployed to:", escrowAddress);

    const logPath = path.join(__dirname, "../deploy.log");
    fs.writeFileSync(logPath, `VERIFIER_ADDRESS=${verifierAddress}\nESCROW_ADDRESS=${escrowAddress}`);
    console.log(`Deployment details saved to deploy.log`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
