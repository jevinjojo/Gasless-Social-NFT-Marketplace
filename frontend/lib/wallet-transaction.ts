import { ethers } from "ethers";
import { contractConfig } from "./contract.config";
import NFTMarketplaceABI from "./contracts/GaslessNFTMarketplace.json";

// Add type declaration for window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

export async function sendWalletTransaction(
    userAddress: string,
    contractData: string
): Promise<any> {
    try {
        console.log("=== Wallet Transaction (Bypass Biconomy) ===");
        
        // Check if window.ethereum exists (MetaMask or other wallet)
        if (!window.ethereum) {
            throw new Error("No wallet detected. Please install MetaMask or connect a wallet.");
        }
        
        // Create a regular ethers provider from the wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        console.log("Using wallet signer:", await signer.getAddress());
        
        // Create the transaction
        const transaction = {
            to: contractConfig.address,
            data: contractData,
            value: "0x0",
            gasLimit: "0x1E8480", // 2M gas limit
        };
        
        console.log("Sending transaction via wallet...");
        console.log("Target contract:", transaction.to);
        console.log("Data length:", transaction.data.length);
        
        // Send transaction directly through wallet (user pays gas)
        const txResponse = await signer.sendTransaction(transaction);
        
        console.log("✅ Wallet transaction sent!");
        console.log("Transaction hash:", txResponse.hash);
        
        // Wait for confirmation
        const receipt = await txResponse.wait();
        console.log("✅ Transaction confirmed!");
        
        return {
            hash: txResponse.hash,
            userOpHash: txResponse.hash,
            transactionHash: txResponse.hash,
            wait: () => Promise.resolve(receipt)
        };
        
    } catch (error: any) {
        console.error("❌ Wallet transaction failed:", error);
        throw new Error(`Wallet transaction failed: ${error.message}`);
    }
}

export async function checkWalletNetwork(): Promise<boolean> {
    try {
        if (!window.ethereum) return false;
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        console.log("Wallet network:", network.chainId.toString());
        console.log("Expected network: 11155111 (Sepolia)");
        
        return network.chainId.toString() === "11155111";
    } catch (error) {
        console.error("Error checking wallet network:", error);
        return false;
    }
}