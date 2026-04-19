import { ethers } from 'ethers'

// ─── MilestoneEscrow ABI (minimal interface) ───
const ESCROW_ABI = [
  'constructor(address _beneficiary, bytes32[] _referenceHashes, uint8[] _percentages)',
  'function deposit() payable',
  'function vote(uint256 _milestoneId)',
  'function releaseFunds()',
  'function pushExpenseHash(bytes32 _expenseHash)',
  'function getMilestone(uint256 _id) view returns (bytes32, uint256, uint8, bool)',
  'function beneficiary() view returns (address)',
  'function totalDeposits() view returns (uint256)',
  'function currentMilestone() view returns (uint256)',
  'function latestExpenseHash() view returns (bytes32)',
  'function deposits(address) view returns (uint256)',
  'function milestoneVotes(uint256, address) view returns (bool)',
  'event Deposited(address indexed investor, uint256 amount)',
  'event Voted(address indexed investor, uint256 indexed milestoneId, uint256 weight)',
  'event MilestoneReleased(uint256 indexed milestoneId, uint256 amount)',
]

const HARDHAT_CHAIN_ID = 31337
const HARDHAT_RPC = 'http://127.0.0.1:8545'

// ─── Provider + Signer ───

/**
 * Get a read-only provider (always works, no wallet needed)
 */
export function getReadProvider() {
  return new ethers.JsonRpcProvider(HARDHAT_RPC)
}

/**
 * Check if MetaMask (or any injected wallet) is available
 */
export function isWalletAvailable() {
  return typeof window !== 'undefined' && !!window.ethereum
}

/**
 * Connect to MetaMask and return { address, provider, signer }
 * Falls back to Hardhat's first default account if no MetaMask
 */
export async function connectWallet() {
  if (isWalletAvailable()) {
    // MetaMask flow
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])

    // Check network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== HARDHAT_CHAIN_ID) {
      await switchToHardhat()
    }

    const signer = await provider.getSigner()
    return {
      address: accounts[0],
      provider,
      signer,
      source: 'metamask',
    }
  } else {
    // Fallback: use Hardhat's default signer (Account #1 — the beneficiary)
    const provider = getReadProvider()
    const signer = await provider.getSigner(1)
    const address = await signer.getAddress()
    return {
      address,
      provider,
      signer,
      source: 'hardhat',
    }
  }
}

/**
 * Request MetaMask to switch to the Hardhat local network
 */
export async function switchToHardhat() {
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.toQuantity(HARDHAT_CHAIN_ID) }],
    })
  } catch (switchError) {
    // Chain doesn't exist in MetaMask — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ethers.toQuantity(HARDHAT_CHAIN_ID),
          chainName: 'Hardhat Local',
          rpcUrls: [HARDHAT_RPC],
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        }],
      })
    }
  }
}

/**
 * Check if the wallet is on the correct network
 */
export async function checkNetwork(provider) {
  const network = await provider.getNetwork()
  return Number(network.chainId) === HARDHAT_CHAIN_ID
}

// ─── Contract Interaction ───

/**
 * Deploy a fresh MilestoneEscrow contract and return its address + instance
 * This is needed because contracts are ephemeral on a local Hardhat node
 */
export async function deployAndConnect(signer) {
  const provider = getReadProvider()
  const deployerSigner = signer || await provider.getSigner(1)

  const beneficiary = await deployerSigner.getAddress()
  const refHashes = [ethers.zeroPadBytes('0x00', 32)]

  const factory = new ethers.ContractFactory(
    ESCROW_ABI,
    // Get bytecode from the compiled artifact
    await fetchBytecode(),
    deployerSigner
  )

  const contract = await factory.deploy(beneficiary, refHashes, [100])
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  return { address, contract }
}

/**
 * Connect to an existing deployed contract
 */
export function getContract(address, signerOrProvider) {
  return new ethers.Contract(address, ESCROW_ABI, signerOrProvider)
}

/**
 * Vote on a milestone (calls vote(uint256))
 */
export async function voteMilestone(contract, milestoneId) {
  const tx = await contract.vote(milestoneId)
  const receipt = await tx.wait()
  return receipt
}

/**
 * Deposit ETH to the escrow
 */
export async function depositToEscrow(contract, amountEth) {
  const tx = await contract.deposit({ value: ethers.parseEther(amountEth.toString()) })
  const receipt = await tx.wait()
  return receipt
}

/**
 * Release milestone funds
 */
export async function releaseMilestoneFunds(contract) {
  const tx = await contract.releaseFunds()
  const receipt = await tx.wait()
  return receipt
}

/**
 * Read milestone data
 */
export async function getMilestoneData(contract, id) {
  const [referenceHash, totalVotes, percentage, released] = await contract.getMilestone(id)
  return {
    referenceHash,
    totalVotes: ethers.formatEther(totalVotes),
    totalVotesRaw: totalVotes,
    percentage: Number(percentage),
    released,
  }
}

/**
 * Get total deposits in the escrow
 */
export async function getTotalDeposits(contract) {
  const deposits = await contract.totalDeposits()
  return ethers.formatEther(deposits)
}

/**
 * Get the current milestone index
 */
export async function getCurrentMilestone(contract) {
  const id = await contract.currentMilestone()
  return Number(id)
}

/**
 * Fetch compiled bytecode from the Hardhat artifacts
 */
async function fetchBytecode() {
  try {
    const res = await fetch('/api/bytecode')
    if (res.ok) return (await res.json()).bytecode
  } catch {}
  // Fallback: use the precompiled artifact via static import
  return BYTECODE_FALLBACK
}

// We'll store the bytecode inline for the demo since we're on a local node
const BYTECODE_FALLBACK = null
