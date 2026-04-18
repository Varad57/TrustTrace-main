const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(1); // Beneficiary
    
    const artifactPath = "../artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    
    const EscrowFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const refHashes = ["0x" + "00".repeat(32)];
    const escrow = await EscrowFactory.deploy(await signer.getAddress(), refHashes, [100]);
    await escrow.waitForDeployment();
    
    console.log("Contract deployed natively via EVM RPC at:", await escrow.getAddress());
    
    const hashRaw = process.env.LATEST_HASH || ("0x" + "00".repeat(32));
    const fullHash = hashRaw.startsWith("0x") ? hashRaw : "0x" + hashRaw;
    
    console.log(`Pushing Expense Hash: ${fullHash} to Blockchain...`);
    const tx = await escrow.pushExpenseHash(fullHash);
    await tx.wait();
    
    const readBack = await escrow.latestExpenseHash();
    if (readBack === fullHash) {
        console.log("✅ Success! Hash successfully securely bound to the blockchain ledger via raw RPC.");
    } else {
        console.log("❌ Failed to bind hash.");
    }
}

main().catch(console.error);
