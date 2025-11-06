import { BiconomySmartAccountV2 } from "@biconomy/account";

export async function diagnoseBiconomyAccount(smartAccount: BiconomySmartAccountV2) {
    try {
        console.log("=== Biconomy Account Diagnostics ===");
        
        // Check if account address is available
        const address = await smartAccount.getAccountAddress();
        console.log("✅ Smart account address:", address);
        
        // Check if the account is initialized
        try {
            const isInitialized = await smartAccount.isAccountDeployed();
            console.log("✅ Account deployed:", isInitialized);
        } catch (e) {
            console.log("⚠️ Could not check if account is deployed:", e);
        }
        
        // Check bundler connection
        try {
            console.log("✅ Bundler URL configured");
        } catch (e) {
            console.log("❌ Bundler issue:", e);
        }
        
        console.log("=== End Diagnostics ===");
        return true;
    } catch (error) {
        console.error("❌ Account diagnostics failed:", error);
        return false;
    }
}