import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import { BeefyCommonBridgeAbi } from '../../../../../config/abi/BeefyCommonBridgeAbi.ts';
import { XErc20Abi } from '../../../../../config/abi/XErc20Abi.ts';
import { BIG_ZERO, fromWei, toWeiString } from '../../../../../helpers/big-number.ts';
import { isFiniteNumber } from '../../../../../helpers/number.ts';
import { bridgeViaCommonInterface } from '../../../actions/wallet/bridge.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeXTokenForChainId,
} from '../../../selectors/bridge.ts';
import { selectChainNativeToken } from '../../../selectors/tokens.ts';
import { selectWalletAddress } from '../../../selectors/wallet.ts';
import type { BeefyState } from '../../../store/types.ts';
import {
  featureFlag_simulateAllBridgeRateLimit,
  featureFlag_simulateBridgeRateLimit,
} from '../../../utils/feature-flags.ts';
import type { BeefyAnyBridgeConfig } from '../../config-types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type {
  AllowanceTokenAmount,
  InputTokenAmount,
  TokenAmount,
} from '../../transact/transact-types.ts';
import type { IBridgeProvider, IBridgeQuote } from './provider-types.ts';

export abstract class CommonBridgeProvider<T extends BeefyAnyBridgeConfig>
  implements IBridgeProvider<T>
{
  abstract readonly id: T['id'];

  async fetchQuote(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    receiver: string | undefined,
    state: BeefyState
  ): Promise<IBridgeQuote<T>> {
    const fromChain = config.chains[from.id];
    const toChain = config.chains[to.id];
    if (!fromChain || !toChain) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }

    const { bridge: bridgeAddress } = fromChain;
    const [fee, fromLimit, toLimit] = await Promise.all([
      this.fetchBridgeFee(config, from, to, input, state),
      this.fetchAmountLimit(bridgeAddress, from, 'outgoing', state),
      this.fetchAmountLimit(bridgeAddress, to, 'incoming', state),
    ]);
    const gas = await this.fetchOutgoingGasLimit(config, from, to, input, fee, state);

    const outputToken = selectBridgeDepositTokenForChainId(state, to.id);
    const output = input.amount;

    const allowance: AllowanceTokenAmount = {
      token: input.token,
      amount: input.amount,
      spenderAddress: bridgeAddress,
    };

    return {
      id: this.id,
      input,
      output: { token: outputToken, amount: output },
      fee,
      gas,
      allowance,
      config,
      timeEstimate: fromChain.time.outgoing + toChain.time.incoming,
      withinLimits: input.amount.lt(fromLimit.current) && output.lt(toLimit.current),
      limits: {
        from: fromLimit,
        to: toLimit,
      },
      receiver,
    };
  }

  protected async fetchAmountLimit(
    bridgeAddress: string,
    chain: ChainEntity,
    direction: 'incoming' | 'outgoing',
    state: BeefyState
  ) {
    const token = selectBridgeXTokenForChainId(state, chain.id);
    const xTokenContract = fetchContract(token.address, XErc20Abi, chain.id);
    const isBurn = direction === 'outgoing';
    const currentMethod = isBurn ? 'burningCurrentLimitOf' : 'mintingCurrentLimitOf';
    const maxMethod = isBurn ? 'burningMaxLimitOf' : 'mintingMaxLimitOf';

    const [currentResult, maxResult] = await Promise.all([
      xTokenContract.read[currentMethod]([bridgeAddress as Address]),
      xTokenContract.read[maxMethod]([bridgeAddress as Address]),
    ]);

    if (
      featureFlag_simulateAllBridgeRateLimit() ||
      (featureFlag_simulateBridgeRateLimit() &&
        bridgeAddress === '0xaaa751957312589Cd21B2348f6B05b8b40691eF3')
    ) {
      return {
        current: new BigNumber('100'),
        max: new BigNumber('1000'),
      };
    }

    const current = fromWei(currentResult.toString(10), token.decimals);
    const max = fromWei(maxResult.toString(10), token.decimals);

    return { current, max };
  }

  protected async fetchOutgoingGasLimit(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: TokenAmount<TokenErc20>,
    fee: TokenAmount<TokenNative>,
    state: BeefyState
  ): Promise<BigNumber> {
    const fromChain = config.chains[from.id];
    if (!fromChain) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }
    const { gasLimits, bridge: bridgeAddress } = fromChain;
    const configEstimate = gasLimits.outgoing.plus(gasLimits.approve || BIG_ZERO);
    const address = selectWalletAddress(state);
    if (!address) {
      return configEstimate;
    }

    try {
      const bridgeContract = fetchContract(bridgeAddress, BeefyCommonBridgeAbi, from.id);
      const inputWei = toWeiString(input.amount, input.token.decimals);
      const feeWei = toWeiString(fee.amount, fee.token.decimals);

      const chainEstimate = await bridgeContract.estimateGas.bridge(
        [BigInt(to.networkChainId), BigInt(inputWei), address as Address],
        {
          account: address as Address,
          value: BigInt(feeWei),
        }
      );

      if (isFiniteNumber(Number(chainEstimate)) && chainEstimate > 0n) {
        return new BigNumber(chainEstimate.toString(10));
      }
    } catch (e) {
      console[gasLimits.approve ? 'warn' : 'error'](this.id, 'fetchOutgoingGasLimit', e);
    }

    return configEstimate;
  }

  protected async fetchBridgeFee(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    try {
      const fromChain = config.chains[from.id];
      const toChain = config.chains[to.id];
      if (!fromChain || !toChain) {
        throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
      }
      const { bridge: bridgeAddress } = fromChain;

      const bridgeContract = fetchContract(bridgeAddress, BeefyCommonBridgeAbi, from.id);
      const inputWei = toWeiString(input.amount, input.token.decimals);
      const feeToken = selectChainNativeToken(state, from.id);

      const feeWei = await bridgeContract.read.bridgeCost([
        BigInt(to.networkChainId),
        BigInt(inputWei),
        toChain.bridge as Address,
      ]);
      const fee = fromWei(feeWei.toString(10), feeToken.decimals);

      return { token: feeToken, amount: fee };
    } catch (e) {
      console.error(this.id, 'fetchBridgeFee', e);
      throw new Error(`Failed to fetch bridge fee for ${this.id}`);
    }
  }

  async fetchBridgeStep(quote: IBridgeQuote<T>, t: TFunction, _state: BeefyState): Promise<Step> {
    return {
      step: 'bridge',
      message: t('Vault-TxnConfirm', { type: t('Bridge-noun') }),
      action: bridgeViaCommonInterface(quote),
      pending: false,
    };
  }
}
