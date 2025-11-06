# 🚀 Gasless Social NFT Marketplace

A modern NFT marketplace that eliminates Web3 friction through social login and gasless transactions. Users can mint NFTs using their Google or Twitter accounts without needing crypto wallets or paying gas fees.

## ✨ Features

- 🔐 **Social Login**: Sign in with Google/Twitter (no wallet needed)
- ⛽ **Gasless Transactions**: Mint NFTs without paying gas fees
- 🔗 **Account Abstraction**: Powered by Biconomy Smart Accounts
- 🎨 **Easy NFT Minting**: Simple form-based NFT creation
- 🌐 **Web3 Integration**: Full blockchain functionality with Web2 UX

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Web3**: Ethers.js, Biconomy SDK, Web3Auth
- **Smart Contracts**: Solidity, Hardhat
- **Authentication**: Web3Auth (Google/Twitter OAuth)
- **Account Abstraction**: Biconomy Smart Accounts
- **Network**: Ethereum Sepolia Testnet

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/gasless-social-nft-marketplace.git
cd gasless-social-nft-marketplace
cd frontend && npm install
cd ../contracts && npm install
```

### 2. Environment Setup

Create `frontend/.env.local`:
```env
# Web3Auth Client ID (Get from https://dashboard.web3auth.io)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_web3auth_client_id

# Biconomy Configuration (Get from https://dashboard.biconomy.io)
NEXT_PUBLIC_BUNDLER_URL=your_biconomy_bundler_url
NEXT_PUBLIC_PAYMASTER_URL=your_biconomy_paymaster_url
NEXT_PUBLIC_BICONOMY_API_KEY=your_biconomy_api_key

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Contract Address (Deploy first, then add here)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Deploy Smart Contract
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network sepolia
# Copy the deployed contract address to your .env.local
```

### 4. Run the App
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## 🔧 Required Setup

### 1. Web3Auth Setup
1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io)
2. Create a new project
3. Add your domain to allowed origins
4. Copy the Client ID to `.env.local`

### 2. Biconomy Setup
1. Go to [Biconomy Dashboard](https://dashboard.biconomy.io)
2. Create a new project on Sepolia
3. Set up a paymaster policy
4. Copy bundler URL, paymaster URL, and API key to `.env.local`

### 3. Alchemy RPC (Optional)
1. Get a free RPC URL from [Alchemy](https://www.alchemy.com)
2. Add to `.env.local` for better reliability

### 4. Sepolia ETH
- Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com)
- Needed for contract deployment and fallback transactions

## 🎮 How to Use

1. **Connect**: Click "Connect Wallet" and choose Google/Twitter
2. **Mint**: Fill in NFT details (name, description, image URL)
3. **Confirm**: Approve the gasless transaction
4. **Done**: Your NFT is minted! Check it on Etherscan

## 🏗️ Project Structure

```
├── contracts/               # Smart contracts
│   ├── contracts/          # Solidity files
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
├── frontend/               # Next.js frontend
│   ├── components/        # React components
│   ├── lib/              # Utilities & configurations
│   └── src/app/          # App router pages
```

## 🚨 Troubleshooting

- **Gas Estimation Failed**: The app automatically falls back to direct wallet transactions
- **Paymaster Issues**: Check your Biconomy dashboard and API key
- **Network Errors**: Ensure you're on Sepolia testnet
- **Login Issues**: Verify Web3Auth client ID and domain settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the Web3 community

## 🔑 What Users Need to Fill:

1. **Web3Auth Client ID**
2. **Biconomy Configuration** 
3. **RPC URL** 
4. **Deploy contract**
5. **Get test ETH**

This gives users everything they need to understand, set up, and run your project!
