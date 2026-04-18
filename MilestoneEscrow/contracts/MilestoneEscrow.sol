// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MilestoneEscrow is ReentrancyGuard {
    address public immutable beneficiary;
    
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

    event Deposited(address indexed investor, uint256 amount);
    event Voted(address indexed investor, uint256 indexed milestoneId, uint256 weight);
    event MilestoneReleased(uint256 indexed milestoneId, uint256 amount);

    constructor(address _beneficiary, bytes32[] memory _referenceHashes, uint8[] memory _percentages) {
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_referenceHashes.length == _percentages.length, "Mismatched arrays");
        
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
        require(totalPercentage == 100, "Total percentage must be 100");
        
        beneficiary = _beneficiary;
    }

    function deposit() external payable {
        require(msg.value > 0, "Deposit must be > 0");
        
        // Investors can deposit as long as the first milestone is not yet released
        require(currentMilestone == 0 && !milestones[0].released, "Escrow already active");

        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function vote(uint256 _milestoneId) external {
        require(_milestoneId == currentMilestone, "Can only vote on current milestone");
        require(!milestones[_milestoneId].released, "Milestone already released");
        
        uint256 voterWeight = deposits[msg.sender];
        require(voterWeight > 0, "Not an investor");
        require(!milestoneVotes[_milestoneId][msg.sender], "Already voted on this milestone");

        milestoneVotes[_milestoneId][msg.sender] = true;
        milestones[_milestoneId].totalVotes += voterWeight;

        emit Voted(msg.sender, _milestoneId, voterWeight);
    }

    function releaseFunds() external nonReentrant {
        require(currentMilestone < milestones.length, "All milestones released");
        
        Milestone storage milestone = milestones[currentMilestone];
        require(!milestone.released, "Milestone already released");
        
        // Check if votes > 50% of total deposits
        require(milestone.totalVotes > totalDeposits / 2, "Not enough votes to release");

        milestone.released = true;

        // Calculate amount to release based on total deposits and milestone percentage
        uint256 amountToRelease = (totalDeposits * milestone.percentage) / 100;
        
        currentMilestone++; // Move to next milestone

        // Follows CEI pattern, ReentrancyGuard adds extra defense
        (bool success, ) = beneficiary.call{value: amountToRelease}("");
        require(success, "Transfer failed");

        emit MilestoneReleased(currentMilestone - 1, amountToRelease);
    }
    
    function pushExpenseHash(bytes32 _expenseHash) external {
        latestExpenseHash = _expenseHash;
    }
    
    // Function to get milestone data for UI
    function getMilestone(uint256 _id) external view returns (bytes32, uint256, uint8, bool) {
        require(_id < milestones.length, "Invalid milestone");
        Milestone memory m = milestones[_id];
        return (m.referenceHash, m.totalVotes, m.percentage, m.released);
    }
}
