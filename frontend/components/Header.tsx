"use client";

import { useWeb3 } from "./contexts/Web3Context";

export default function Header() {
  const { userAddress, isLoading, login, logout } = useWeb3();

  return (
    <header className="bg-gray-900 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Gasless NFT Marketplace
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {userAddress ? (
              <>
                <div className="hidden md:flex items-center bg-gray-800 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-400">Smart Account:</span>
                  <span className="ml-2 text-sm font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}