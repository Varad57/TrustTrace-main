import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Pre-computed bytes32 hashes for milestones
const DEFAULT_HASHES = [
  "0xea69cd3b44b8226027c9d968516aa88eff033baf47d95d12224f8d48858e9ab1", // Hash 1
  "0xcf3db6ac80f1d9faac338d6fcb20ac88d7486e92b3a1a9e96e066b1baea318dd", // Hash 2
  "0x8f3cbede41de607c346ac704ea3d537aa252d621b1dbd836ea7aa0a520f924df"  // Hash 3
];

export default buildModule("MilestoneEscrowModule", (m) => {
  const beneficiary = m.getParameter("beneficiary", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // Local Hardhat Default Account 0
  const referenceHashes = m.getParameter("referenceHashes", DEFAULT_HASHES);
  const percentages = m.getParameter("percentages", [20, 30, 50]);

  const escrow = m.contract("MilestoneEscrow", [
    beneficiary,
    referenceHashes,
    percentages
  ]);

  return { escrow };
});
