export const config = {
  privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  accountIndex: 0,
  chainId: 56,
  rpcUrl: 'https://1rpc.io/bnb',
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL,
  biconomyPaymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL,
  preferredToken: '',
  tokenList: [],
};

export const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS;
