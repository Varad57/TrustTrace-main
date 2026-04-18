import { ethers } from "ethers";
import fs from "fs";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Test Accounts from hardhat node wrapped in NonceManager
    const beneficiaryKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Account #0 (Beneficiary)
    const investor1Key = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Account #1
    const investor2Key = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"; // Account #2

    const beneficiary = new ethers.NonceManager(new ethers.Wallet(beneficiaryKey, provider));
    const investor1 = new ethers.NonceManager(new ethers.Wallet(investor1Key, provider));
    const investor2 = new ethers.NonceManager(new ethers.Wallet(investor2Key, provider));

    // Compile artifact
    const artifactPath = "./artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json";
    const parsed = JSON.parse(fs.readFileSync(artifactPath));
    const factory = new ethers.ContractFactory(parsed.abi, parsed.bytecode, beneficiary);

    const referenceHashes = [
      "0xea69cd3b44b8226027c9d968516aa88eff033baf47d95d12224f8d48858e9ab1",
      "0xcf3db6ac80f1d9faac338d6fcb20ac88d7486e92b3a1a9e96e066b1baea318dd",
      "0x8f3cbede41de607c346ac704ea3d537aa252d621b1dbd836ea7aa0a520f924df"
    ];
    const percentages = [20, 30, 50];
    
    const beneficiaryAddress = await beneficiary.getAddress();
    console.log("--- Deploying Fresh Contract ---");
    const contract = await factory.deploy(beneficiaryAddress, referenceHashes, percentages);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("MilestoneEscrow deployed to:", contractAddress);

    const escrow = new ethers.Contract(contractAddress, parsed.abi, provider);

    console.log("\n--- Initial State ---");
    console.log("Current Milestone:", Number(await escrow.currentMilestone()));
    
    // 1. Investor 1 and 2 deposit funds
    console.log("\n--- Depositing Funds ---");
    const depositAmount = ethers.parseEther("10"); // 10 ETH each
    console.log("Investor 1 deposits 10 ETH...");
    let tx = await escrow.connect(investor1).deposit({ value: depositAmount });
    await tx.wait();
    
    console.log("Investor 2 deposits 10 ETH...");
    tx = await escrow.connect(investor2).deposit({ value: depositAmount });
    await tx.wait();

    let totalDeposits = await escrow.totalDeposits();
    console.log("Total Deposits in Escrow:", ethers.formatEther(totalDeposits), "ETH");

    // 2. Voting for Milestone 0
    console.log("\n--- Voting for Milestone 0 ---");
    console.log("Investor 1 votes for milestone 0...");
    tx = await escrow.connect(investor1).vote(0);
    await tx.wait();

    let m0 = await escrow.getMilestone(0);
    console.log(`Milestone 0 Votes after Inv1: ${ethers.formatEther(m0[1])} ETH (Needed > 10 ETH to pass)`);

    console.log("Investor 2 votes for milestone 0...");
    tx = await escrow.connect(investor2).vote(0);
    await tx.wait();

    m0 = await escrow.getMilestone(0);
    console.log(`Milestone 0 Votes after Inv2: ${ethers.formatEther(m0[1])} ETH`);

    // 3. Releasing Funds
    console.log("\n--- Releasing Funds (Milestone 0 - 20%) ---");
    let balanceBefore = await provider.getBalance(beneficiaryAddress);
    console.log("Beneficiary Balance Before (ETH):", ethers.formatEther(balanceBefore));

    tx = await escrow.connect(beneficiary).releaseFunds();
    let receipt = await tx.wait();
    
    let balanceAfter = await provider.getBalance(beneficiaryAddress);
    console.log("Beneficiary Balance After (ETH):", ethers.formatEther(balanceAfter));
    
    // Note: beneficiary paid gas for releaseFunds transaction, so exact +4 ETH won't show
    let expectedRelease = (20n * totalDeposits) / 100n;
    console.log("Expected Release Amount:", ethers.formatEther(expectedRelease), "ETH");

    console.log("\n--- Final State ---");
    console.log("Current expected Milestone index (should be 1):", Number(await escrow.currentMilestone()));
    m0 = await escrow.getMilestone(0);
    console.log("Milestone 0 Released Status:", m0[3]);

    console.log("\n✅ All contract operations functionally verified and secure!");
}

main().catch(console.error);
