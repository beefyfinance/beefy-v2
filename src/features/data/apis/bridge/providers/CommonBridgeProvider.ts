import type { BeefyAnyBridgeConfig } from '../../config-types';
import type {
  AllowanceTokenAmount,
  InputTokenAmount,
  TokenAmount,
} from '../../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './provider-types';
import type { ChainEntity } from '../../../entities/chain';
import { BeefyCommonBridgeAbi } from '../../../../../config/abi';
import { getWeb3Instance } from '../../instances';
import { BIG_ZERO, fromWeiString, toWeiString } from '../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../redux-types';
import { selectChainNativeToken } from '../../../selectors/tokens';
import { selectBridgeSourceChainId, selectBridgeTokenForChainId } from '../../../selectors/bridge';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';
import { walletActions } from '../../../actions/wallet-actions';
import BigNumber from 'bignumber.js';
import { selectWalletAddress } from '../../../selectors/wallet';
import { isFiniteNumber } from '../../../../../helpers/number';

export abstract class CommonBridgeProvider<T extends BeefyAnyBridgeConfig>
  implements IBridgeProvider<T>
{
  readonly id: T['id'];

  async fetchQuote(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<IBridgeQuote<T>> {
    if (!(from.id in config.chains) || !(to.id in config.chains)) {
      throw new Error(`bridge '${this.id}' not available for ${from}->${to}.`);
    }

    const canonicalChainId = selectBridgeSourceChainId(state);
    const { bridge: bridgeAddress } = config.chains[from.id];
    const fee = await this.fetchBridgeFee(config, from, to, input, state);
    const gas = await this.fetchOutgoingGasLimit(config, from, to, input, fee, state);

    const outputToken = selectBridgeTokenForChainId(state, to.id);
    const output = input.amount;

    const allowance: AllowanceTokenAmount = {
      token: input.token,
      amount: input.amount,
      spenderAddress: bridgeAddress,
    };

    const baseQuote: IBridgeQuote<T> = {
      id: this.id,
      input,
      output: { token: outputToken, amount: output },
      fee,
      gas,
      config,
      timeEstimate: config.chains[from.id].time.outgoing + config.chains[to.id].time.incoming,
    };

    return from.id === canonicalChainId ? { ...baseQuote, allowance } : baseQuote;
  }

  protected async fetchOutgoingGasLimit(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: TokenAmount<TokenErc20>,
    fee: TokenAmount<TokenNative>,
    state: BeefyState
  ): Promise<BigNumber> {
    const { gasLimits, bridge: bridgeAddress } = config.chains[from.id];
    const configEstimate = gasLimits.outgoing.plus(gasLimits.approve || BIG_ZERO);
    const address = selectWalletAddress(state);
    if (!address) {
      return configEstimate;
    }

    try {
      const web3 = await getWeb3Instance(from);
      const contract = new web3.eth.Contract(BeefyCommonBridgeAbi, bridgeAddress);
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
      const { bridge: bridgeAddress } = config.chains[from.id];
      const contract = new web3.eth.Contract(BeefyCommonBridgeAbi, bridgeAddress);
      const inputWei = toWeiString(input.amount, input.token.decimals);

      const feeToken = selectChainNativeToken(state, from.id);
      const feeWei = await contract.methods
        .bridgeCost(to.networkChainId, inputWei, config.chains[to.id].bridge)
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
