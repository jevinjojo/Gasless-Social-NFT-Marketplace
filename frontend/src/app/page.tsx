"use client";

import Header from "@/components/Header";
import MintNFT from "@/components/nft/MintNFT";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Gasless NFT Marketplace</h2>
          <p className="text-gray-400">Mint and trade NFTs without paying gas fees using Biconomy!</p>
        </div>

        <MintNFT />
      </main>
    </div>
  );
}