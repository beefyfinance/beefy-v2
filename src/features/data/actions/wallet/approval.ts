import type { TokenErc20 } from '../../entities/token.ts';
import BigNumber from 'bignumber.js';
import { captureWalletErrors, sendTransaction, txStart } from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi.ts';
import { selectChainNativeToken } from '../../selectors/tokens.ts';
import { bigNumberToBigInt, fromWei, toWei } from '../../../../helpers/big-number.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import type { BeefyDispatchFn, BeefyStateFn } from '../../store/types.ts';
import { fetchAllowanceAction } from '../allowance.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import type { AllowanceTokenAmount } from '../../apis/transact/transact-types.ts';
import { featureFlag_disableExactApprovals } from '../../utils/feature-flags.ts';

// "unlimited": large, but safe for tokens that store allowances in fewer than 256 bits
const UNLIMITED_APPROVAL_WEI = new BigNumber('8000000000000000000000000000');

export const approve = (
  token: TokenErc20,
  spenderAddress: string,
  amount: BigNumber,
  unlimited: boolean = false
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(token.chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const viemContract = fetchWalletContract(token.address, ERC20Abi, walletClient);
    const native = selectChainNativeToken(state, token.chainId);

    const amountWei = approvalAmountWei(token, amount, unlimited);
    const chain = selectChainById(state, token.chainId);
    const gasPrices = await getGasPriceOptions(chain);

    sendTransaction({
      dispatch,
      chainId: token.chainId,
      walletClient,
      builder: () =>
        viemContract.write.approve([spenderAddress as Address, amountWei], {
          account: address as Address,
          ...gasPrices,
          chain: publicClient.chain,
        }),
      additionalData: {
        spender: spenderAddress,
        amount: fromWei(amountWei.toString(10), token.decimals),
        token: token,
      },
      refreshOnSuccess: {
        walletAddress: address,
        chainId: token.chainId,
        spenderAddress,
        tokens: uniqBy([token, native], 'id'),
      },
    });
  });
};

function approvalAmountWei(token: TokenErc20, amount: BigNumber, unlimited: boolean): bigint {
  const amountWei = toWei(amount, token.decimals);
  return bigNumberToBigInt(
    unlimited || featureFlag_disableExactApprovals() ?
      BigNumber.max(amountWei, UNLIMITED_APPROVAL_WEI)
    : amountWei
  );
}

/** Approve step needed to cover `required`, given the current allowance */
export function getApproveSteps(
  required: AllowanceTokenAmount,
  currentAllowance: BigNumber,
  t: TFunction<Namespace>,
  unlimited: boolean = false
): Step[] {
  const { token, spenderAddress, amount } = required;
  if (currentAllowance.gte(amount)) {
    return [];
  }

  const isUnlimited = unlimited || featureFlag_disableExactApprovals();
  return [
    {
      step: 'approve',
      message: t(isUnlimited ? 'Vault-ApproveUnlimitedMsg' : 'Vault-ApproveMsg', {
        token: token.symbol,
      }),
      action: approve(token, spenderAddress, amount, unlimited),
      pending: false,
      extraInfo: { approval: { ...required, kind: isUnlimited ? 'unlimited' : 'exact' } },
    },
  ];
}

/** Like getApproveSteps, but refreshes the allowance on-chain first */
export async function fetchApproveSteps(
  required: AllowanceTokenAmount,
  t: TFunction<Namespace>,
  dispatch: BeefyDispatchFn,
  getState: BeefyStateFn,
  unlimited: boolean = false
): Promise<Step[]> {
  const { token, spenderAddress } = required;
  const walletAddress = selectWalletAddress(getState());
  if (walletAddress) {
    await dispatch(
      fetchAllowanceAction({
        chainId: token.chainId,
        spenderAddress,
        tokens: [token],
        walletAddress,
      })
    );
  }

  const currentAllowance = selectAllowanceByTokenAddress(
    getState(),
    token.chainId,
    token.address,
    spenderAddress
  );
  return getApproveSteps(required, currentAllowance, t, unlimited);
}
