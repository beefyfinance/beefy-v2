import type { ChainEntity } from '../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../entities/token.ts';
import BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter.ts';
import {
  bindTransactionEvents,
  captureWalletErrors,
  txStart,
  txWallet,
  type TxWriteProps,
} from './common.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { selectChainNativeToken, selectChainWrappedNativeToken } from '../../selectors/tokens.ts';
import { getOneInchApi, getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import { MinterAbi } from '../../../../config/abi/MinterAbi.ts';
import { selectChainById } from '../../selectors/chains.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import { convertAmountToRawNumber } from '../../../../helpers/format.ts';
import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';
import { toWei } from '../../../../helpers/big-number.ts';
import { selectOneInchSwapAggregatorForChain } from '../../selectors/zap.ts';

export const mintDeposit = (
  minter: MinterEntity,
  payToken: TokenEntity,
  mintedToken: TokenEntity,
  amount: BigNumber,
  max: boolean,
  slippageTolerance: number = 0.01
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const { minterAddress, chainId, canZapInWithOneInch } = minter;
    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(minterAddress, MinterAbi, walletClient);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);
    const amountInWei = toWei(amount, payToken.decimals);
    const amountInWeiString = amountInWei.toString(10);
    const isNative = isTokenNative(payToken);
    const txProps: TxWriteProps = {
      account: address as Address,
      ...gasPrices,
      chain: publicClient.chain,
    };

    const buildCall = async (args: TxWriteProps) => {
      if (canZapInWithOneInch) {
        const swapInToken = isNative ? selectChainWrappedNativeToken(state, chainId) : payToken;
        const oneInchSwapAgg = selectOneInchSwapAggregatorForChain(state, chain.id);
        if (!oneInchSwapAgg) {
          throw new Error(`No 1inch swap aggregator found for ${chain.id}`);
        }

        const oneInchApi = await getOneInchApi(chain);
        const swapData = await oneInchApi.getSwap({
          disableEstimate: true, // otherwise will fail due to no allowance
          from: minterAddress,
          amount: amountInWeiString,
          src: swapInToken.address,
          dst: mintedToken.address,
          slippage: slippageTolerance * 100,
        });
        const amountOutWei = new BigNumber(swapData.dstAmount);
        const amountOutWeiAfterSlippage = amountOutWei
          .multipliedBy(1 - slippageTolerance)
          .decimalPlaces(0, BigNumber.ROUND_FLOOR);
        const shouldMint = amountOutWeiAfterSlippage.isLessThan(amountInWei);

        // mint is better
        if (shouldMint) {
          return isNative ?
              contract.write.depositNative(['0x', true], {
                ...args,
                value: BigInt(amountInWeiString),
              })
            : contract.write.deposit([BigInt(amountInWeiString), '0x', true], args);
        }

        // swap after max slippage is better
        return isNative ?
            contract.write.depositNative([swapData.tx.data as `0x${string}`, false], {
              ...args,
              value: BigInt(amountInWeiString),
            })
            // contract.methods.depositNative(swapData.tx.data, false)
          : contract.write.deposit(
              [BigInt(amountInWeiString), swapData.tx.data as `0x${string}`, false],
              args
            );
      }

      // non-zap
      if (isNative) {
        return contract.write.depositNative({
          ...args,
          value: BigInt(amountInWeiString),
        });
      }

      if (max) {
        return contract.write.depositAll(args);
      }

      return contract.write.deposit([BigInt(amountInWeiString)], args);
    };
    txWallet(dispatch);
    const transaction = buildCall(txProps);

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        amount: amount,
        token: mintedToken,
      },
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: minterAddress,
        tokens: uniqBy([gasToken, payToken, mintedToken], 'id'),
        minterId: minter.id,
      }
    );
  });
};
export const burnWithdraw = (
  chainId: ChainEntity['id'],
  contractAddr: string,
  withdrawnToken: TokenEntity,
  burnedToken: TokenEntity,
  amount: BigNumber,
  _max: boolean,
  minterId: MinterEntity['id']
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      return;
    }

    const gasToken = selectChainNativeToken(state, chainId);
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(chainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const contract = fetchWalletContract(contractAddr, MinterAbi, walletClient);
    const chain = selectChainById(state, chainId);
    const gasPrices = await getGasPriceOptions(chain);

    txWallet(dispatch);
    const transaction = (() => {
      const rawAmount = convertAmountToRawNumber(amount, burnedToken.decimals);
      return contract.write.withdraw([BigInt(rawAmount)], {
        account: address as Address,
        ...gasPrices,
        chain: publicClient.chain,
      });
    })();

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        amount: amount,
        token: burnedToken,
      },
      {
        walletAddress: address,
        chainId: chainId,
        spenderAddress: contractAddr,
        tokens: uniqBy([gasToken, withdrawnToken, burnedToken], 'id'),
        minterId,
      }
    );
  });
};
