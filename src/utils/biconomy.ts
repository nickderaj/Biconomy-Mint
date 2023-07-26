import { config, nftAddress } from '@/constants/biconomy.constants';
import { BiconomySmartAccount, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { Bundler } from '@biconomy/bundler';
import {
  BiconomyPaymaster,
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from '@biconomy/paymaster';
import { ethers } from 'ethers';

const createAccount = async () => {
  try {
    const signer = ethers.Wallet.createRandom(); // random wallet to sign transaction

    const bundler = new Bundler({
      bundlerUrl: config.bundlerUrl,
      chainId: config.chainId,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });

    const paymaster = new BiconomyPaymaster({ paymasterUrl: config.biconomyPaymasterUrl });
    const biconomySmartAccountConfig = {
      signer: signer,
      chainId: config.chainId,
      rpcUrl: config.rpcUrl,
      paymaster: paymaster,
      bundler: bundler,
    };

    let biconomyAccount = new BiconomySmartAccount(biconomySmartAccountConfig);
    biconomyAccount = await biconomyAccount.init();
    const address = await biconomyAccount.getSmartAccountAddress();
    const isDeployed = await biconomyAccount.isAccountDeployed(address);

    return { biconomyAccount, isDeployed };
  } catch (error) {
    return { biconomyAccount: null, isDeployed: false };
  }
};

export const gaslessMint = async (userAddress: string, nftId: string) => {
  ////////// 1. Initialize Biconomy Smart Account SDK //////////
  if (!userAddress || !nftId) return 'Failed to create user';

  const { biconomyAccount } = await createAccount();
  if (!biconomyAccount) return 'Failed to create user';

  ////////// 2. Build Partial User op from your user Transaction //////////
  const incrementTx = new ethers.utils.Interface([
    'function mint(address toAddress, uint256 typeId, uint256 amount) payable',
  ]);
  const data = incrementTx.encodeFunctionData('mint', [userAddress, String(nftId), 1]);
  const transaction = { to: nftAddress, data: data };
  const userOp = await biconomyAccount.buildUserOp([transaction]);

  ////////// 3. Get Paymaster & Data from Biconomy //////////
  const biconomyPaymaster = biconomyAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
  const paymasterServiceData: SponsorUserOperationDto = {
    mode: PaymasterMode.SPONSORED,
  };

  try {
    const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
      userOp,
      paymasterServiceData,
    );
    userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
  } catch (e) {
    console.log('error received ', e);
    return 'Failed to create user';
  }
  if (userOp.paymasterAndData == '0x') return;

  ////////// 4. Sign the UserOp and send to the Bundler //////////
  try {
    const userOpResponse = await biconomyAccount.sendUserOp(userOp);
    const transactionDetails = await userOpResponse.wait();
    console.log(`transactionDetails: ${JSON.stringify(transactionDetails, null, '\t')}`);
    return transactionDetails;
  } catch (e) {
    console.log('error received ', e);
    return 'Failed to create user';
  }
};
