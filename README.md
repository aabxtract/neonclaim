Merkle Airdrop Claim dApp

A simple and elegant decentralized application that allows eligible users to claim tokens from a Merkle-proof–secured airdrop.
Users connect their wallet, the app checks their eligibility, and if approved, they can instantly claim their allocated tokens.

🚀 Overview

Merkle Airdrop Claim is a lightweight Web3 application designed to demonstrate:

Merkle tree whitelisting

Secure airdrop claiming

Frontend–smart contract interaction

Smooth user flow for token distribution

This project is great for:

Beginners learning Web3

Portfolio projects

Token pre-launch airdrops

Community reward systems

✨ Features

🔗 Connect Wallet (MetaMask, WalletConnect, etc.)

🌿 Merkle Proof Verification

🪂 Claim Allocation if eligible

🔐 One-time claim protection

📊 Displays user allocation amount

🎨 Minimal, futuristic UI

⚠️ Error & success toasts

🧪 Fully testable locally

🛠️ Tech Stack
Smart Contract

Solidity

Hardhat or Foundry

ERC20 token standard

Merkle-based eligibility validation

Frontend

Next.js / React

Wagmi + Viem

TailwindCSS

RainbowKit (optional)

Tools

Merkle Tree Builder

IPFS / Vercel for hosting

📦 Smart Contract Structure

The Airdrop contract includes:

bytes32 public merkleRoot;

mapping(address => bool) public claimed;

claim(bytes32[] calldata proof) external

Validation checks:

Address in whitelist

Address has not claimed

Signature validated using Merkle proof

🧩 User Flow

Open the app

Connect wallet

The app:

Checks Merkle tree for eligibility

Fetches the token amount allocated

If eligible → Claim

Transaction success ✔

“Claimed” state is saved in contract

🧪 Setup Instructions
1️⃣ Clone
git clone https://github.com/yourname/merkle-airdrop.git
cd merkle-airdrop

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create .env.local:

NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_RPC_URL=

4️⃣ Run frontend
npm run dev

📁 Project Structure
/contracts
  └── Airdrop.sol
/frontend
  ├── components
  ├── pages
  ├── styles
  └── utils (merkle tree helpers)

🔮 Future Enhancements

Add analytics dashboard

Add NFT airdrop support

Integrate on-chain signatures (EIP-712)

Multi-token airdrop support

Social login integration

📝 License