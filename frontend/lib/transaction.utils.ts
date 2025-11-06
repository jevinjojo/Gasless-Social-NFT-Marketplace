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
        console.log("Preparing Biconomy transaction...");
        
        // Ensure proper formatting
        const formattedTx = {
            to: ethers.getAddress(txRequest.to), // Ensure proper address format
            data: txRequest.data,
            value: txRequest.value || "0x0",
        };
        
        console.log("Formatted transaction to:", formattedTx.to);
        console.log("Transaction data length:", formattedTx.data.length);
        
        // Method 1: Direct sendTransaction (most common)
        try {
            console.log("Attempting direct sendTransaction...");
            
            // Skip manual gas estimation for now as it's causing issues
            console.log("Skipping manual gas estimation...");
            
            const result = await smartAccount.sendTransaction(formattedTx);
            console.log("Direct sendTransaction successful");
            return result;
        } catch (directError: any) {
            console.log("Direct sendTransaction failed:", directError.message);
            
            // Method 2: Try with explicit gas estimation
            if (directError.message?.includes("callGasLimit") || directError.message?.includes("gas")) {
                try {
                    console.log("Attempting with gas estimation...");
                    
                    // Build user operation first
                    const userOp = await smartAccount.buildUserOp([formattedTx]);
                    console.log("Built user operation successfully");
                    
                    // Send the user operation
                    const result = await smartAccount.sendUserOp(userOp);
                    console.log("User operation successful");
                    return result;
                } catch (gasError: any) {
                    console.log("Gas estimation method failed:", gasError.message);
                }
            }
            
            // Method 3: Try with array format
            try {
                console.log("Attempting with array format...");
                const result = await smartAccount.sendTransaction([formattedTx]);
                console.log("Array format successful");
                return result;
            } catch (arrayError: any) {
                console.log("Array format failed:", arrayError.message);
            }
            
            // If all methods fail, throw the original error
            throw directError;
        }
        
    } catch (error: any) {
        console.error("All transaction methods failed:", error);
        
        // Provide more specific error messages
        if (error.message?.includes("callGasLimit")) {
            throw new Error("Gas estimation failed. This might be due to network issues or contract problems. Please try again.");
        } else if (error.message?.includes("paymaster")) {
            throw new Error("Paymaster service is unavailable. Please try again later.");
        } else if (error.message?.includes("insufficient")) {
            throw new Error("Insufficient funds or gas. Please check your account balance.");
        } else if (error.message?.includes("revert")) {
            throw new Error("Transaction would fail. Please check the contract parameters.");
        }
        
        throw error;
    }
}