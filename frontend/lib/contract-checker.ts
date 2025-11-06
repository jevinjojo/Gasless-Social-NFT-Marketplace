import { ethers } from "ethers";
import { contractConfig } from "./contract.config";
import { biconomyConfig } from "./biconomy.config";

export async function checkContractExists(): Promise<boolean> {
    try {
        const provider = new ethers.JsonRpcProvider(biconomyConfig.rpcUrl);
        const code = await provider.getCode(contractConfig.address);
        
        // If code is "0x", the contract doesn't exist
        const exists = code !== "0x";
        console.log("Contract exists:", exists);
        console.log("Contract address:", contractConfig.address);
        
        return exists;
    } catch (error) {
        console.error("Error checking contract:", error);
        return false;
    }
}

export async function checkNetwork(): Promise<boolean> {
    try {
        const provider = new ethers.JsonRpcProvider(biconomyConfig.rpcUrl);
        const network = await provider.getNetwork();
        
        console.log("Network chain ID:", network.chainId.toString());
        console.log("Expected chain ID:", biconomyConfig.chainId);
        
        return network.chainId.toString() === biconomyConfig.chainId.toString();
    } catch (error) {
        console.error("Error checking network:", error);
        return false;
    }
}