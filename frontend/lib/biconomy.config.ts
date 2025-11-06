export const biconomyConfig = {
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL!,
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL!,
    biconomyApiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY!,
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
};