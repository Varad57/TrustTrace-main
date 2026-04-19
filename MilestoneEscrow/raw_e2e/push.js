const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
    // 🔥 STEP 2 Checklist: MUST be Sepolia RPC
    // Replace with your ALCHEMY or INFURA URL!
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/zZdM7wS_pESKEI50VOf3l");

    // 🔥 STEP 3 Checklist: MUST be a real wallet with Sepolia ETH
    const PRIVATE_KEY = "de899b40b38a247c7dae830a273a72297b3c87e276e6b7aad6e7696bd39d25f8";
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const artifactPath = "../artifacts/contracts/MilestoneEscrow.sol/MilestoneEscrow.json";
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 🔥 STEP 1 Checklist: Same Contract Everywhere
    const contractAddress = "0x7427B9f0887652543FF93A4f46092f3c2159378F";
    const escrow = new ethers.Contract(contractAddress, artifact.abi, signer);

    console.log("Connected natively via EVM RPC to existing Sepolia contract:", contractAddress);

    const hashRaw = process.env.LATEST_HASH || ("0x" + "00".repeat(32));
    const fullHash = hashRaw.startsWith("0x") ? hashRaw : "0x" + hashRaw;

    console.log(`Pushing Expense Hash: ${fullHash} to Blockchain...`);

    // 🔥 STEP 5 Checklist: Sending tx and getting hash
    const tx = await escrow.pushExpenseHash(fullHash);
    console.log("Transaction ID:", tx.hash); // 👉 This is what you check on Etherscan!

    await tx.wait(); // Wait for confirmation on Sepolia

    console.log("✅ Success! Check Etherscan for this transaction!");
}

main().catch(console.error);
