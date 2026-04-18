import hardhat from "hardhat";

async function main() {
    const Escrow = await hardhat.ethers.getContractFactory("MilestoneEscrow");
    const signers = await hardhat.ethers.getSigners();
    const beneficiary = signers[1].address;
    
    console.log("Deploying fresh Integration Escrow...");
    const escrow = await Escrow.deploy(beneficiary, ["0x" + "00".repeat(32)], [100]);
    await escrow.waitForDeployment();
    console.log("Contract instantiated at:", await escrow.getAddress());

    const hashRaw = process.env.LATEST_HASH || ("0x" + "00".repeat(32));
    const fullHash = hashRaw.startsWith("0x") ? hashRaw : "0x" + hashRaw;

    console.log(`Pushing Expense Hash: ${fullHash} to Blockchain...`);
    const tx = await escrow.pushExpenseHash(fullHash);
    await tx.wait();
    
    const stored = await escrow.latestExpenseHash();
    if (stored === fullHash) {
        console.log("✅ Success! Hash successfully securely bound to the blockchain ledger.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
