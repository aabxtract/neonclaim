# **App Name**: NeonClaim

## Core Features:

- Wallet Connection: Connect to user's wallet using MetaMask or WalletConnect.
- Eligibility Check: Verify user eligibility for airdrop using Merkle proof from a JSON whitelist.
- Claim Function: Enable users to claim tokens via a `claim(bytes32[] proof)` function, interacting with the smart contract.
- State Management: Manage UI states: Not Connected -> Connected -> Eligible -> Claimed, updating UI elements accordingly.
- Notification System: Display toast notifications for transaction status, errors, and successful claims.
- Amount Calculation: Determine airdrop amount based on the provided Merkle Proof and user eligibility, then display the tokens in the wallet

## Style Guidelines:

- Primary color: Neon purple (#A020F0) to capture a futuristic and cyberpunk aesthetic, providing a vibrant base for the UI.
- Background color: Dark desaturated purple (#262329) creates a dark backdrop allowing the neon purple elements to pop.
- Accent color: Electric blue (#7DF9FF), which complements the neon purple, will highlight interactive elements and provide a visual cue to the user.
- Font: 'Space Grotesk' (sans-serif) for a computerized, techy, scientific feel. 'Inter' (sans-serif) used as a body.
- Implement a single-page layout to maintain simplicity. Use glassmorphism to highlight claim UI elements.
- Incorporate subtle animations, such as a gradient background and smooth transitions, to enhance user experience.
- Use minimalist icons in line with a web3/gamer aesthetic. Choose icons with a futuristic, clean style to fit the cyberpunk theme.