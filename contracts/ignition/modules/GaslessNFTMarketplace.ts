import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GaslessNFTMarketplaceModule = buildModule("GaslessNFTMarketplaceModule", (m) => {
  const marketplace = m.contract("GaslessNFTMarketplace");

  return { marketplace };
});

export default GaslessNFTMarketplaceModule;
