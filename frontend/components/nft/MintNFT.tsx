"use client";

import { useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import { ethers } from "ethers";
import { contractConfig } from "@/lib/contract.config";
import NFTMarketplaceABI from "@/lib/contracts/GaslessNFTMarketplace.json";
import { sendBiconomyTransaction } from "@/lib/transaction.utils";
import { sendAlternativeTransaction } from "@/lib/alternative-transaction";
import { sendSimpleTransaction } from "@/lib/simple-transaction";
import { sendDirectTransaction } from "@/lib/direct-transaction";
import { checkContractExists, checkNetwork } from "@/lib/contract-checker";
import { diagnoseBiconomyAccount } from "@/lib/account-diagnostics";
import { sendWalletTransaction, checkWalletNetwork } from "@/lib/wallet-transaction";

export default function MintNFT() {
  const { smartAccount, userAddress } = useWeb3();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!smartAccount || !userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsMinting(true);
      setTxHash("");

      console.log("Starting mint process...");
      console.log("Smart account address:", userAddress);
      console.log("Contract address:", contractConfig.address);

      // Check if contract exists and network is correct
      const contractExists = await checkContractExists();
      const networkValid = await checkNetwork();
      
      if (!contractExists) {
        throw new Error("Smart contract not found. Please check the contract address.");
      }
      
      if (!networkValid) {
        throw new Error("Network mismatch. Please ensure you're connected to Sepolia testnet.");
      }

      // Run diagnostics on the smart account
      console.log("Running Biconomy account diagnostics...");
      await diagnoseBiconomyAccount(smartAccount);
      
      // Check smart account balance for gas estimation
      console.log("🔍 Checking smart account balance...");
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const balance = await provider.getBalance(userAddress);
      
      if (balance === 0n) {
        const fundingMessage = `
🔧 SMART ACCOUNT NEEDS SEPOLIA ETH

Your smart account has 0 ETH balance. Even for gasless transactions, 
you need a small amount of ETH for gas estimation simulation.

📋 QUICK FIX (2 minutes):
1. Go to: https://sepoliafaucet.com
2. Enter this address: ${userAddress}
3. Request 0.1 Sepolia ETH
4. Wait for confirmation (1-2 minutes)
5. Try minting again

🔗 Alternative faucets:
• https://faucet.sepolia.dev
• https://www.alchemy.com/faucets/ethereum-sepolia

💡 Why needed?
• Gas estimation requires ETH for simulation
• Paymaster will still sponsor your actual gas costs
• You only need ~0.01 ETH (one-time setup)
• This enables TRUE gasless transactions

⚠️ Use only Sepolia testnet ETH (free from faucets)
        `;
        alert(fundingMessage);
        
        // Also open the faucet in a new tab for user convenience
        window.open("https://sepoliafaucet.com", "_blank");
        return;
      }
      
      console.log(`✅ Smart account balance: ${ethers.formatEther(balance)} ETH - proceeding with transaction...`);

      // Create metadata JSON
      const metadata = {
        name,
        description,
        image,
      };

      // For demo, we'll use a simple data URI for metadata
      // In production, upload to IPFS
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      console.log("Metadata URI:", metadataURI);

      // Create contract interface
      const contractInterface = new ethers.Interface(NFTMarketplaceABI.abi);

      // Encode function call
      const mintData = contractInterface.encodeFunctionData("mintWithMetadata", [metadataURI]);
      console.log("Encoded mint data:", mintData);

      // Prepare transaction object
      const txRequest = {
        to: contractConfig.address,
        data: mintData,
        value: "0x0", // Use hex format for value
      };

      console.log("Transaction request to:", txRequest.to);
      console.log("Transaction data length:", txRequest.data.length);
      console.log("Transaction value:", txRequest.value);

      // Try sending gasless transaction with Biconomy (proper gasless flow)
      let tx;
      
      // Method 0: Try BASIC gasless transaction with explicit gas
      try {
        console.log("🚀 Attempting BASIC gasless transaction with fixed gas...");
        
        // Create transaction with explicit gas to bypass estimation
        const basicTx = {
          to: txRequest.to,
          data: txRequest.data,
          value: "0",
          gasLimit: "300000", // Fixed gas limit
        };
        
        console.log("Using fixed gas limit:", basicTx.gasLimit);
        
        // Try the most basic sendTransaction call
        tx = await smartAccount.sendTransaction(basicTx);
        console.log("✅ BASIC gasless transaction successful!");
      } catch (basicError: any) {
        console.log("❌ Basic gasless method failed:", basicError.message);
        console.log("❌ Basic gasless error details:", basicError);
        
        // Method 1: Primary gasless transaction method (Biconomy)
        try {
          console.log("🚀 Attempting standard gasless transaction via Biconomy...");
          tx = await sendBiconomyTransaction(smartAccount, txRequest);
          console.log("✅ Standard gasless transaction successful!");
        } catch (primaryError: any) {
          console.log("Primary gasless method failed:", primaryError.message);
          
          // Method 2: Simple gasless transaction (Biconomy fallback)
          try {
            console.log("Attempting simple gasless transaction...");
            tx = await sendSimpleTransaction(smartAccount, { to: txRequest.to, data: txRequest.data });
            console.log("✅ Simple gasless transaction successful!");
          } catch (simpleError: any) {
            console.log("Simple gasless method failed:", simpleError.message);
            
            // Method 3: Direct gasless transaction (no paymaster, but still gasless)
            try {
              console.log("Attempting direct gasless transaction...");
              tx = await sendDirectTransaction(smartAccount, txRequest.to, txRequest.data);
              console.log("✅ Direct gasless transaction successful!");
            } catch (directError: any) {
              console.log("Direct gasless method failed:", directError.message);
              
              // Method 4: Alternative gasless methods
              try {
                console.log("Attempting alternative gasless transaction...");
                tx = await sendAlternativeTransaction(smartAccount, txRequest);
                console.log("✅ Alternative gasless transaction successful!");
              } catch (altError: any) {
                console.log("All gasless methods failed:", altError.message);
                
                // Method 5: Wallet fallback (ONLY if all gasless methods fail)
                try {
                  console.log("⚠️ Gasless failed - attempting wallet transaction as last resort...");
                  console.log("Note: This will require gas payment from user");
                  
                  // Check if wallet is available and on correct network
                  const walletNetworkOk = await checkWalletNetwork();
                  if (!walletNetworkOk) {
                    throw new Error("Wallet not available or not on Sepolia network");
                  }
                  
                  // Confirm with user before charging gas
                  const userConfirms = window.confirm(
                    "Gasless transaction failed. Would you like to proceed with a regular transaction (you will pay gas fees)?"
                  );
                  
                  if (!userConfirms) {
                    throw new Error("User cancelled transaction");
                  }
                  
                  tx = await sendWalletTransaction(userAddress!, txRequest.data);
                  console.log("✅ Wallet transaction successful (user paid gas)");
                } catch (walletError: any) {
                  console.log("Wallet fallback also failed:", walletError.message);
                  throw new Error(`All transaction methods failed. Please check your connection and try again. Error: ${walletError.message}`);
                }
              }
            }
          }
        }
      }

      console.log("Transaction sent successfully");
      
      // Handle different response formats
      const txHash = tx.userOpHash || tx.hash || tx.transactionHash || "";
      setTxHash(txHash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed with hash:", txHash);

      alert("NFT Minted Successfully! 🎉");
      setName("");
      setDescription("");
      setImage("");
    } catch (error: any) {
      console.error("Minting error:", error);
      
      // Use the error message from the transaction utility if available
      const errorMessage = error.message || "Failed to mint NFT";
      alert(errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  if (!userAddress) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Please connect your wallet to mint NFTs</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Mint New NFT</h2>

      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">NFT Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome NFT"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your NFT..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {image && (
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
          </div>
        )}

        <button
          type="submit"
          disabled={isMinting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {isMinting ? "Minting..." : "Mint NFT (Gasless)"}
        </button>

        {txHash && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-sm text-green-400">
              Transaction Hash:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}