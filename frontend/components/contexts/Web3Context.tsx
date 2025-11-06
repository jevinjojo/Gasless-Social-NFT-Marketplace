"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { 
    createSmartAccountClient, 
    BiconomySmartAccountV2,
    PaymasterMode 
} from "@biconomy/account";
import { ethers } from "ethers";
import { biconomyConfig } from "@/lib/biconomy.config";
import { createSmartAccount } from "@/lib/smart-account.config";

interface Web3ContextType {
    web3Auth: Web3Auth | null;
    smartAccount: BiconomySmartAccountV2 | null;
    userAddress: string | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
    web3Auth: null,
    smartAccount: null,
    userAddress: null,
    isLoading: false,
    login: async () => { },
    logout: async () => { },
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
    const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initWeb3Auth();
    }, []);

    const initWeb3Auth = async () => {
        try {
            const chainConfig = {
                chainNamespace: CHAIN_NAMESPACES.EIP155,
                chainId: "0xaa36a7", // Sepolia
                rpcTarget: biconomyConfig.rpcUrl,
                displayName: "Sepolia Testnet",
                blockExplorerUrl: "https://sepolia.etherscan.io",
                ticker: "ETH",
                tickerName: "Ethereum",
            };

            const privateKeyProvider = new EthereumPrivateKeyProvider({
                config: { chainConfig },
            });

            const web3AuthInstance = new Web3Auth({
                clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
                web3AuthNetwork: "sapphire_devnet",
                privateKeyProvider,
            });

            const openloginAdapter = new OpenloginAdapter({
                privateKeyProvider,
                adapterSettings: {
                    uxMode: "popup",
                },
            });

            // ✅ Configure MetaMask adapter
            const metamaskAdapter = new MetamaskAdapter({
                clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
                sessionTime: 3600,
            });

            web3AuthInstance.configureAdapter(openloginAdapter);
            web3AuthInstance.configureAdapter(metamaskAdapter);
            await web3AuthInstance.initModal();
            setWeb3Auth(web3AuthInstance);

            if (web3AuthInstance.connected) {
                await setupSmartAccount(web3AuthInstance.provider!);
            }
        } catch (error) {
            console.error("Error initializing Web3Auth:", error);
        }
    };

    const setupSmartAccount = async (provider: IProvider) => {
        try {
            setIsLoading(true);

            const ethersProvider = new ethers.BrowserProvider(provider as any);
            const signer = await ethersProvider.getSigner();

            console.log("Setting up smart account...");
            const smartAccountInstance = await createSmartAccount(signer);

            const address = await smartAccountInstance.getAccountAddress();
            console.log("Smart account address:", address);

            setSmartAccount(smartAccountInstance);
            setUserAddress(address);
        } catch (error) {
            console.error("Error setting up smart account:", error);
            throw error; // Re-throw to handle in calling function
        } finally {
            setIsLoading(false);
        }
    };

    const login = async () => {
        if (!web3Auth) {
            console.error("Web3Auth not initialized");
            return;
        }

        try {
            setIsLoading(true);
            const provider = await web3Auth.connect();
            if (provider) {
                await setupSmartAccount(provider);
            }
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (!web3Auth) return;

        try {
            await web3Auth.logout();
            setSmartAccount(null);
            setUserAddress(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                web3Auth,
                smartAccount,
                userAddress,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}