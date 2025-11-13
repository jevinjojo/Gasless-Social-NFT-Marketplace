import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";

export interface TransactionRequest {
    to: string;
    data: string;
    value?: string;
    gasLimit?: string;
}

export async function sendBiconomyTransaction(
    smartAccount: BiconomySmartAccountV2,
    txRequest: TransactionRequest
): Promise<any> {
    try {
        console.log("🚀 Preparing Biconomy v2 gasless transaction...");
        
        // Format transaction for v2 API
        const transaction = {
            to: txRequest.to,
            data: txRequest.data,
            value: txRequest.value || "0",
        };
        
        console.log("Transaction details:");
        console.log("- To:", transaction.to);
        console.log("- Data length:", transaction.data.length);
        console.log("- Value:", transaction.value);
        
        // Method 1: Try with paymaster sponsorship
        try {
            console.log("Attempting sponsored transaction...");
            
            const userOpResponse = await smartAccount.sendTransaction(transaction, {
                paymasterServiceData: { mode: "SPONSORED" },
            });
            
            console.log("✅ Sponsored transaction successful!");
            return userOpResponse;
            
        } catch (sponsoredError: any) {
            console.log("❌ Sponsored transaction failed:", sponsoredError.message);
            
            // Method 2: Try without explicit paymaster mode
            try {
                console.log("Attempting basic gasless transaction...");
                
                const userOpResponse = await smartAccount.sendTransaction(transaction);
                console.log("✅ Basic gasless transaction successful!");
                return userOpResponse;
                
            } catch (basicError: any) {
                console.log("❌ Basic gasless transaction failed:", basicError.message);
                
                // Method 3: Try with manual user operation building
                try {
                    console.log("Attempting manual user operation...");
                    
                    // Build user operation manually
                    const partialUserOp = await smartAccount.buildUserOp([transaction]);
                    
                    // Send the user operation
                    const userOpResponse = await smartAccount.sendUserOp(partialUserOp);
                    console.log("✅ Manual user operation successful!");
                    return userOpResponse;
                    
                } catch (manualError: any) {
                    console.log("❌ Manual user operation failed:", manualError.message);
                    
                    // Method 4: Try self-funded (user pays gas)
                    try {
                        console.log("Attempting self-funded transaction...");
                        
                        const userOpResponse = await smartAccount.sendTransaction(transaction, {
                            paymasterServiceData: { mode: "ERC20" }, // This typically means self-funded
                        });
                        
                        console.log("✅ Self-funded transaction successful!");
                        return userOpResponse;
                        
                    } catch (selfFundedError: any) {
                        console.log("❌ Self-funded transaction failed:", selfFundedError.message);
                        throw basicError; // Throw the most relevant error
                    }
                }
            }
        }
        
    } catch (error: any) {
        console.error("❌ All Biconomy transaction methods failed:", error);
        
        // Provide specific error messages based on the error
        if (error.message?.includes("callGasLimit") || error.message?.includes("undefined")) {
            throw new Error("Gas estimation failed due to API version mismatch. Please check your smart account balance and try again.");
        } else if (error.message?.includes("paymaster")) {
            throw new Error("Paymaster service is unavailable. The transaction will require gas payment.");
        } else if (error.message?.includes("insufficient")) {
            throw new Error("Insufficient balance. Please fund your smart account with some Sepolia ETH.");
        } else if (error.message?.includes("revert")) {
            throw new Error("Transaction would fail. Please check the contract function and parameters.");
        }
        
        throw error;
    }
}