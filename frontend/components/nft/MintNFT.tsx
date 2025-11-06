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

      // Try sending transaction with multiple methods (starting with wallet bypass)
      let tx;
      
      // Method 0: Direct wallet transaction (bypasses Biconomy completely)
      try {
        console.log("Attempting direct wallet transaction (bypassing Biconomy)...");
        
        // Check if wallet is on correct network
        const walletNetworkOk = await checkWalletNetwork();
        if (!walletNetworkOk) {
          throw new Error("Wallet not on Sepolia network");
        }
        
        tx = await sendWalletTransaction(userAddress!, txRequest.data);
        console.log("✅ Wallet transaction successful!");
      } catch (walletError: any) {
        console.log("Wallet method failed:", walletError.message);
        
        // Method 1: Simple transaction (Biconomy fallback)
        try {
          console.log("Attempting simple transaction method...");
          tx = await sendSimpleTransaction(smartAccount, { to: txRequest.to, data: txRequest.data });
        } catch (simpleError: any) {
          console.log("Simple method failed:", simpleError.message);
        
        // Method 2: Primary transaction method
        try {
          console.log("Attempting primary transaction method...");
          tx = await sendBiconomyTransaction(smartAccount, txRequest);
        } catch (primaryError: any) {
          console.log("Primary method failed, trying alternative method...");
          console.log("Primary error:", primaryError.message);
          
          // Method 3: Direct transaction (bypass paymaster issues)
          try {
            console.log("Attempting direct transaction (no paymaster)...");
            tx = await sendDirectTransaction(smartAccount, txRequest.to, txRequest.data);
          } catch (directError: any) {
            console.log("Direct method failed:", directError.message);
            
              // Method 4: Alternative methods as last resort
              try {
                tx = await sendAlternativeTransaction(smartAccount, txRequest);
              } catch (altError: any) {
                console.log("All methods failed!");
                throw new Error(`All transaction methods failed. Try wallet method first, then contact support if issues persist.`);
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