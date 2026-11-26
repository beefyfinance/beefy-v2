import type { TokenErc20 } from '../../entities/token.ts';
import BigNumber from 'bignumber.js';
import { captureWalletErrors, sendTransaction, txStart } from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { ERC20Abi } from '../../../../config/abi/ERC20Abi.ts';
import { selectChainNativeToken } from '../../selectors/tokens.ts';
import { BIG_ZERO, bigNumberToBigInt, fromWei, toWei } from '../../../../helpers/big-number.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import {
  type Address,
  BaseError,
  encodeFunctionData,
  type EIP1193RequestFn,
  RpcRequestError,
} from 'viem';
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
  // a reset must stay 0, even with the kill switch on
  if (amountWei.isZero()) {
    return 0n;
  }
  return bigNumberToBigInt(
    unlimited || featureFlag_disableExactApprovals() ?
      BigNumber.max(amountWei, UNLIMITED_APPROVAL_WEI)
    : amountWei
  );
}

const MAX_RESET_CHECK_RPCS = 3;

function isRevertError(err: unknown): boolean {
  return (
    err instanceof BaseError &&
    !!err.walk(
      e =>
        (e instanceof RpcRequestError && e.code === 3) ||
        (e instanceof BaseError && /revert/i.test(e.details))
    )
  );
}

/**
 * USDT-style tokens revert when changing one non-zero allowance to another.
 * Detected by simulating the approve instead of keeping a token list.
 * Each RPC is asked directly: the fallback transport only surfaces the last RPC's error,
 * which would hide a revert behind e.g. a rate limit.
 */
async function isNonZeroApproveRejected(
  token: TokenErc20,
  spenderAddress: string,
  amountWei: bigint,
  walletAddress: string
): Promise<boolean> {
  const client = rpcClientManager.getSingleClient(token.chainId);
  const transports: { request: EIP1193RequestFn }[] = (
    client.transport as { transports?: { request: EIP1193RequestFn }[] }
  ).transports ?? [client];
  const data = encodeFunctionData({
    abi: ERC20Abi,
    functionName: 'approve',
    args: [spenderAddress as Address, amountWei],
  });

  for (const transport of transports.slice(0, MAX_RESET_CHECK_RPCS)) {
    try {
      await transport.request({
        method: 'eth_call',
        params: [{ from: walletAddress as Address, to: token.address as Address, data }, 'latest'],
      });
      return false;
    } catch (err) {
      if (isRevertError(err)) {
        return true;
      }
    }
  }

  // unknown: try the plain approve rather than adding a possibly needless tx
  return false;
}

/**
 * Approve steps needed to cover `required`, given the current allowance.
 * Approves the exact amount (or unlimited), preceded by a reset to 0 when the token requires it.
 */
export async function getApproveSteps(
  required: AllowanceTokenAmount,
  currentAllowance: BigNumber,
  walletAddress: string | undefined,
  t: TFunction<Namespace>,
  unlimited: boolean = false
): Promise<Step[]> {
  const { token, spenderAddress, amount } = required;
  if (currentAllowance.gte(amount)) {
    return [];
  }

  const isUnlimited = unlimited || featureFlag_disableExactApprovals();
  const steps: Step[] = [];
  if (
    walletAddress &&
    currentAllowance.gt(BIG_ZERO) &&
    (await isNonZeroApproveRejected(
      token,
      spenderAddress,
      approvalAmountWei(token, amount, unlimited),
      walletAddress
    ))
  ) {
    steps.push({
      step: 'approve',
      message: t('Vault-ApproveResetMsg', { token: token.symbol }),
      action: approve(token, spenderAddress, BIG_ZERO),
      pending: false,
      extraInfo: { approval: { ...required, kind: 'reset' } },
    });
  }

  steps.push({
    step: 'approve',
    message: t(isUnlimited ? 'Vault-ApproveUnlimitedMsg' : 'Vault-ApproveMsg', {
      token: token.symbol,
    }),
    action: approve(token, spenderAddress, amount, unlimited),
    pending: false,
    extraInfo: { approval: { ...required, kind: isUnlimited ? 'unlimited' : 'exact' } },
  });

  return steps;
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
  return getApproveSteps(required, currentAllowance, walletAddress, t, unlimited);
}
