/ SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
  Airdrop.sol
  ERC20 Token Airdrop Claim Contract using Merkle Proofs

  Features:
  - Users can claim allocated tokens if they are in the Merkle tree
  - Only claimable once per wallet
  - Uses OpenZeppelin ERC20 interface
  - Emits events for each claim
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TokenAirdrop {
    IERC20 public token;          // ERC20 token being airdropped
    bytes32 public merkleRoot;    // Merkle root of wallet allocations
    mapping(address => bool) public hasClaimed; // Track claimed wallets

    // Events
    event Claimed(address indexed user, uint256 amount);

    constructor(address _token, bytes32 _merkleRoot) {
        require(_token != address(0), "Token address cannot be zero");
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev Claim allocated tokens using Merkle proof.
     * @param amount The amount allocated to the caller
     * @param merkleProof Proof array to verify inclusion in the Merkle tree
     */
    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        // Compute the leaf node from sender address and amount
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        // Verify the proof
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");

        // Mark as claimed
        hasClaimed[msg.sender] = true;

        // Transfer tokens
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit Claimed(msg.sender, amount);
    }

    /**
     * @dev Check if a wallet can claim (useful for frontend)
     */
    function canClaim(address user) external view returns (bool) {
        return !hasClaimed[user];
    }

    /**
     * @dev Optional: update the Merkle root (admin only)
     */
    function updateMerkleRoot(bytes32 newRoot) external {
        // Optional: add Ownable modifier if you want admin control
        merkleRoot = newRoot;
    }
}
