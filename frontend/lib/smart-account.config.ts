import { createSmartAccountClient, BiconomySmartAccountV2, BiconomyPaymaster } from "@biconomy/account";
import { ethers } from "ethers";
import { biconomyConfig } from "./biconomy.config";

export async function createSmartAccount(signer: ethers.Signer): Promise<BiconomySmartAccountV2> {
    try {
        console.log("Creating smart account with consistent v2 API...");
        console.log("Bundler URL:", biconomyConfig.bundlerUrl);
        console.log("Paymaster URL:", biconomyConfig.paymasterUrl);
        console.log("Chain ID:", biconomyConfig.chainId);
        
        // Create paymaster instance with v2 API
        const paymaster = new BiconomyPaymaster({
            paymasterUrl: biconomyConfig.paymasterUrl,
        });
        
        // Create smart account with proper v2 configuration
        const smartAccountConfig = {
            signer,
            bundlerUrl: biconomyConfig.bundlerUrl,
            biconomyPaymasterApiKey: biconomyConfig.biconomyApiKey,
            chainId: biconomyConfig.chainId,
            rpcUrl: biconomyConfig.rpcUrl,
        };
        
        console.log("Creating smart account with v2 configuration...");
        const smartAccount = await createSmartAccountClient(smartAccountConfig);
        
        console.log("✅ Smart account created successfully with v2 API");
        return smartAccount;
        
    } catch (error: any) {
        console.error("Failed to create smart account:", error);
        
        // Fallback: Try without paymaster if main config fails
        try {
            console.log("Trying fallback configuration without paymaster...");
            const fallbackConfig = {
                signer,
                bundlerUrl: biconomyConfig.bundlerUrl,
                chainId: biconomyConfig.chainId,
                rpcUrl: biconomyConfig.rpcUrl,
            };
            
            const smartAccount = await createSmartAccountClient(fallbackConfig);
            console.log("✅ Smart account created with fallback config (no paymaster)");
            return smartAccount;
            
        } catch (fallbackError) {
            console.error("Fallback configuration also failed:", fallbackError);
            throw new Error(`Smart account creation failed: ${error.message}`);
        }
    }
}