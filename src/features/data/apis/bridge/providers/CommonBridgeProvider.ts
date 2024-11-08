import type { BeefyAnyBridgeConfig } from '../../config-types';
import type {
  AllowanceTokenAmount,
  InputTokenAmount,
  TokenAmount,
} from '../../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './provider-types';
import type { ChainEntity } from '../../../entities/chain';
import { BeefyCommonBridgeAbi } from '../../../../../config/abi/BeefyCommonBridgeAbi';
import { XErc20Abi } from '../../../../../config/abi/XErc20Abi';
import { getWeb3Instance } from '../../instances';
import { BIG_ZERO, fromWeiString, toWeiString } from '../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../redux-types';
import { selectChainNativeToken } from '../../../selectors/tokens';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeXTokenForChainId,
} from '../../../selectors/bridge';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';
import { walletActions } from '../../../actions/wallet-actions';
import { BigNumber } from 'bignumber.js';
import { selectWalletAddress } from '../../../selectors/wallet';
import { isFiniteNumber } from '../../../../../helpers/number';
import { MultiCall } from 'eth-multicall';
import {
  featureFlag_simulateAllBridgeRateLimit,
  featureFlag_simulateBridgeRateLimit,
} from '../../../utils/feature-flags';
import { viemToWeb3Abi } from '../../../../../helpers/web3';

export abstract class CommonBridgeProvider<T extends BeefyAnyBridgeConfig>
  implements IBridgeProvider<T>
{
  readonly id: T['id'];

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
    const web3 = await getWeb3Instance(chain);
    const contract = new web3.eth.Contract(viemToWeb3Abi(XErc20Abi), token.address);
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const isBurn = direction === 'outgoing';

    type MulticallReturnType = [
      [
        {
          current: string;
          max: string;
        }
      ]
    ];

    const currentMethod = isBurn ? 'burningCurrentLimitOf' : 'mintingCurrentLimitOf';
    const maxMethod = isBurn ? 'burningMaxLimitOf' : 'mintingMaxLimitOf';
    const [[data]] = (await multicall.all([
      [
        {
          current: contract.methods[currentMethod](bridgeAddress),
          max: contract.methods[maxMethod](bridgeAddress),
        },
      ],
    ])) as MulticallReturnType;

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

    const current = fromWeiString(data.current, token.decimals);
    const max = fromWeiString(data.max, token.decimals);

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
      const web3 = await getWeb3Instance(from);
      const contract = new web3.eth.Contract(viemToWeb3Abi(BeefyCommonBridgeAbi), bridgeAddress);
      const inputWei = toWeiString(input.amount, input.token.decimals);
      const feeWei = toWeiString(fee.amount, fee.token.decimals);
      const chainEstimate: number = await contract.methods
        .bridge(to.networkChainId, inputWei, address)
        .estimateGas({
          from: address,
          value: feeWei,
        });
      if (isFiniteNumber(chainEstimate) && chainEstimate > 0) {
        return new BigNumber(chainEstimate);
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
      const web3 = await getWeb3Instance(from);
      const fromChain = config.chains[from.id];
      const toChain = config.chains[to.id];
      if (!fromChain || !toChain) {
        throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
      }

      const { bridge: bridgeAddress } = fromChain;
      const contract = new web3.eth.Contract(viemToWeb3Abi(BeefyCommonBridgeAbi), bridgeAddress);
      const inputWei = toWeiString(input.amount, input.token.decimals);

      const feeToken = selectChainNativeToken(state, from.id);
      const feeWei = await contract.methods
        .bridgeCost(to.networkChainId, inputWei, toChain.bridge)
        .call();
      const fee = fromWeiString(feeWei, feeToken.decimals);

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
      action: walletActions.bridgeViaCommonInterface(quote),
      pending: false,
    };
  }
}
