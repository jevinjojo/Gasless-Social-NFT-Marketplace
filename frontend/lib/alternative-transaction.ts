import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";

export interface SimpleTransactionRequest {
    to: string;
    data: string;
    value?: string;
}

export async function sendAlternativeTransaction(
    smartAccount: BiconomySmartAccountV2,
    txRequest: SimpleTransactionRequest
): Promise<any> {
    try {
        console.log("Trying alternative transaction methods...");

        // Format transaction properly
        const tx = {
            to: txRequest.to,
            data: txRequest.data,
            value: txRequest.value || "0x0"
        };

        console.log("Transaction details:");
        console.log("- To:", tx.to);
        console.log("- Data length:", tx.data.length);
        console.log("- Value:", tx.value);

        // Method 1: Try with explicit gas limit
        try {
            console.log("Method 1: Trying with explicit gas limit...");
            const txWithGas = {
                ...tx,
                gasLimit: "0x1E8480" // 2M gas limit
            };
            const result = await smartAccount.sendTransaction(txWithGas);
            console.log("Method 1 successful!");
            return result;
        } catch (error1: any) {
            console.log("Method 1 failed:", error1.message);
        }

        // Method 2: Try building user op manually
        try {
            console.log("Method 2: Building user operation manually...");

            // Build the user operation
            const userOp = await smartAccount.buildUserOp([tx]);
            console.log("User operation built successfully");

            // Send the user operation
            const result = await smartAccount.sendUserOp(userOp);
            console.log("Method 2 successful!");
            return result;
        } catch (error2: any) {
            console.log("Method 2 failed:", error2.message);
        }

        // Method 3: Try with different value formats
        try {
            console.log("Method 3: Trying with BigInt value...");
            const txWithBigInt = {
                ...tx,
                value: BigInt(0)
            };
            const result = await smartAccount.sendTransaction(txWithBigInt);
            console.log("Method 3 successful!");
            return result;
        } catch (error3: any) {
            console.log("Method 3 failed:", error3.message);
        }

        // Method 4: Basic transaction without extra parameters
        try {
            console.log("Method 4: Basic transaction...");
            const basicTx = {
                to: tx.to,
                data: tx.data
            };
            const result = await smartAccount.sendTransaction(basicTx);
            console.log("Method 4 successful!");
            return result;
        } catch (error4: any) {
            console.log("Method 4 failed:", error4.message);
        }

        // Method 5: Try with different paymaster mode
        try {
            console.log("Method 5: Trying without paymaster (user pays gas)...");
            const result = await smartAccount.sendTransaction(tx, { 
                paymasterServiceData: { mode: "SPONSORED" as any },
                overrides: {
                    maxFeePerGas: "20000000000", // 20 gwei as string
                    maxPriorityFeePerGas: "2000000000", // 2 gwei as string
                }
            });
            console.log("Method 5 successful!");
            return result;
        } catch (error5: any) {
            console.log("Method 5 failed:", error5.message);
        }

        throw new Error("All alternative transaction methods failed");

    } catch (error: any) {
        console.error("Alternative transaction failed:", error);
        throw error;
    }
}