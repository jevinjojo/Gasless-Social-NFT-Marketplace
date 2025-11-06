import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying GaslessNFTMarketplace to Sepolia...");

  // Connect to Sepolia
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log("Deploying with account:", wallet.address);

  // Load contract ABI and bytecode
  const artifactPath = join(process.cwd(), "artifacts/contracts/GaslessNFTMarketplace.sol/GaslessNFTMarketplace.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  // Create contract factory
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  // Deploy contract
  console.log("Deploying contract...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Deployed to:", address);
  console.log("\nSave this address for your frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});