// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./Verifier.sol";

contract MilestoneEscrow is ReentrancyGuard {

    address public immutable beneficiary;
    Verifier public verifier;

    uint256 public totalDeposits;
    mapping(address => uint256) public deposits;

    struct Milestone {
        bytes32 referenceHash;
        uint256 totalVotes;
        uint8 percentage;
        bool released;
    }

    mapping(uint256 => mapping(address => bool)) public milestoneVotes;

    Milestone[] public milestones;
    uint256 public currentMilestone;

    bytes32 public latestExpenseHash;

    // -------------------- EVENTS --------------------

    event Deposited(address indexed investor, uint256 amount);
    event Voted(address indexed investor, uint256 indexed milestoneId, uint256 weight);
    event MilestoneReleased(uint256 indexed milestoneId, uint256 amount);
    event ExpenseHashUpdated(bytes32 hash);
    event EmergencyWithdraw(uint256 amount);

    // -------------------- CONSTRUCTOR --------------------

    constructor(
        address _beneficiary,
        bytes32[] memory _referenceHashes,
        uint8[] memory _percentages,
        address _verifierAddress
    ) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_verifierAddress != address(0), "Invalid verifier");
        require(_referenceHashes.length == _percentages.length, "Array mismatch");

        verifier = Verifier(_verifierAddress);

        uint16 totalPercentage = 0;

        for (uint i = 0; i < _percentages.length; i++) {
            require(_percentages[i] > 0, "Percentage must be > 0");

            totalPercentage += _percentages[i];

            milestones.push(Milestone({
                referenceHash: _referenceHashes[i],
                totalVotes: 0,
                percentage: _percentages[i],
                released: false
            }));
        }

        require(totalPercentage == 100, "Total must be 100");

        beneficiary = _beneficiary;
    }

    // -------------------- DEPOSIT --------------------

    function deposit() external payable {
        require(msg.value > 0, "Deposit > 0 required");

        require(
            currentMilestone == 0 && !milestones[0].released,
            "Deposits closed"
        );

        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    // -------------------- VOTING --------------------

    function vote(uint256 _milestoneId) external {
        require(_milestoneId == currentMilestone, "Vote only current");

        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.released, "Already released");

        uint256 weight = deposits[msg.sender];
        require(weight > 0, "Not investor");

        require(!milestoneVotes[_milestoneId][msg.sender], "Already voted");

        milestoneVotes[_milestoneId][msg.sender] = true;
        milestone.totalVotes += weight;

        emit Voted(msg.sender, _milestoneId, weight);
    }

    // -------------------- ZKP VERIFICATION --------------------

    function verifyEligibility(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) public view returns (bool) {
        return verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
    }

    // -------------------- RELEASE --------------------

    function releaseFunds(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external nonReentrant {
        require(currentMilestone < milestones.length, "All done");

        Milestone storage milestone = milestones[currentMilestone];
        require(!milestone.released, "Already released");

        // 🔐 ZKP CORE: verify off-chain generated SNARK proof
        require(verifier.verifyProof(_pA, _pB, _pC, _pubSignals), "ZKP verification failed");

        // 🔐 HASH CORE: backend proof verification
        require(
            milestone.referenceHash == latestExpenseHash,
            "Hash mismatch"
        );

        // 🗳️ Majority voting
        require(
            milestone.totalVotes > totalDeposits / 2,
            "Not enough votes"
        );

        milestone.released = true;

        uint256 amount =
            (totalDeposits * milestone.percentage) / 100;

        currentMilestone++;

        (bool success, ) = beneficiary.call{value: amount}("");
        require(success, "Transfer failed");

        emit MilestoneReleased(currentMilestone - 1, amount);
    }

    // -------------------- BACKEND --------------------

    function pushExpenseHash(bytes32 _hash) external {
        require(msg.sender == beneficiary, "Only backend");

        latestExpenseHash = _hash;

        emit ExpenseHashUpdated(_hash);
    }

    // -------------------- SAFETY --------------------

    function emergencyWithdraw() external nonReentrant {
        require(msg.sender == beneficiary, "Only beneficiary");

        uint256 bal = address(this).balance;

        (bool success, ) = beneficiary.call{value: bal}("");
        require(success, "Withdraw failed");

        emit EmergencyWithdraw(bal);
    }

    // -------------------- VIEW --------------------

    function getMilestone(uint256 _id)
        external
        view
        returns (bytes32, uint256, uint8, bool)
    {
        require(_id < milestones.length, "Invalid id");

        Milestone memory m = milestones[_id];
        return (m.referenceHash, m.totalVotes, m.percentage, m.released);
    }
}