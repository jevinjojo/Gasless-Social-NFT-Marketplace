import { createSmartAccountClient, BiconomySmartAccountV2 } from "@biconomy/account";
import { ethers } from "ethers";
import { biconomyConfig } from "./biconomy.config";

export async function createSmartAccount(signer: ethers.Signer): Promise<BiconomySmartAccountV2> {
    try {
        console.log("Creating smart account with bundler URL:", biconomyConfig.bundlerUrl);
        console.log("Chain ID:", biconomyConfig.chainId);
        
        // Try different configuration approaches
        const configs = [
            // Config 1: Minimal working configuration
            {
                signer,
                bundlerUrl: biconomyConfig.bundlerUrl,
                biconomyPaymasterApiKey: biconomyConfig.biconomyApiKey,
            },
            // Config 2: With chain ID
            {
                signer,
                bundlerUrl: biconomyConfig.bundlerUrl,
                biconomyPaymasterApiKey: biconomyConfig.biconomyApiKey,
                chainId: biconomyConfig.chainId,
            },
            // Config 3: Full configuration with RPC
            {
                signer,
                bundlerUrl: biconomyConfig.bundlerUrl,
                biconomyPaymasterApiKey: biconomyConfig.biconomyApiKey,
                chainId: biconomyConfig.chainId,
                rpcUrl: biconomyConfig.rpcUrl,
            }
        ];
        
        for (let i = 0; i < configs.length; i++) {
            try {
                console.log(`Trying smart account config ${i + 1}`);
                const smartAccount = await createSmartAccountClient(configs[i]);
                console.log(`Smart account created successfully with config ${i + 1}`);
                return smartAccount;
            } catch (error) {
                console.error(`Config ${i + 1} failed:`, error);
                if (i === configs.length - 1) throw error;
            }
        }
        
        throw new Error("All smart account configurations failed");
    } catch (error) {
        console.error("Failed to create smart account:", error);
        throw error;
    }
}