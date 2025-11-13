import { BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";

export async function sendDirectTransaction(
    smartAccount: BiconomySmartAccountV2,
    to: string,
    data: string
): Promise<any> {
    try {
        console.log("=== Direct Transaction (No Paymaster) ===");
        
        // Create the transaction without any paymaster configuration
        const transaction = {
            to: ethers.getAddress(to),
            data: data,
            value: 0, // Use number instead of string
        };
        
        console.log("Sending direct transaction without paymaster...");
        console.log("Target:", transaction.to);
        console.log("Data length:", transaction.data.length);
        
        // Send transaction with paymaster (gasless)
        const txResponse = await smartAccount.sendTransaction(transaction);
        
        console.log("✅ Direct transaction submitted!");
        return txResponse;
        
    } catch (sponsoredError: any) {
        console.log("Sponsored mode failed, trying self-funded...");
        
        try {
            // Try completely without paymaster
            const basicTransaction = {
                to: ethers.getAddress(to),
                data: data,
            };
            
            const txResponse = await smartAccount.sendTransaction(basicTransaction);
            console.log("✅ Self-funded transaction successful!");
            return txResponse;
            
        } catch (selfFundedError: any) {
            console.error("❌ Both sponsored and self-funded failed");
            console.error("Sponsored error:", sponsoredError.message);
            console.error("Self-funded error:", selfFundedError.message);
            throw new Error(`Direct transaction failed: ${selfFundedError.message}`);
        }
    }
}