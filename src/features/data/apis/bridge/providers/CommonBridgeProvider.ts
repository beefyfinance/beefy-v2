import type { BeefyAnyBridgeConfig } from '../../config-types';
import type {
  AllowanceTokenAmount,
  InputTokenAmount,
  TokenAmount,
} from '../../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './provider-types';
import type { ChainEntity } from '../../../entities/chain';
import { getContract } from '../../../../../helpers/getContract';
import { BeefyCommonBridgeAbi } from '../../../../../config/abi';
import { getWeb3Instance } from '../../instances';
import { fromWeiString, toWeiString } from '../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../redux-types';
import { selectChainNativeToken } from '../../../selectors/tokens';
import { selectBridgeSourceChainId, selectBridgeTokenForChainId } from '../../../selectors/bridge';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';
import { walletActions } from '../../../actions/wallet-actions';

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
      config,
    };

    return from.id === canonicalChainId ? { ...baseQuote, allowance } : baseQuote;
  }

  protected async fetchBridgeFee(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    const web3 = await getWeb3Instance(from);
    const { bridge: bridgeAddress } = config.chains[from.id];
    const contract = getContract(bridgeAddress, web3, BeefyCommonBridgeAbi);
    const inputWei = toWeiString(input.amount, input.token.decimals);

    const feeToken = selectChainNativeToken(state, to.id);
    const feeWei = await contract.methods
      .bridgeCost(to.networkChainId, inputWei, config.chains[to.id].bridge)
      .call();
    const fee = fromWeiString(feeWei, feeToken.decimals);

    return { token: feeToken, amount: fee };
  }

  async fetchBridgeStep(quote: IBridgeQuote<T>, t: TFunction, state: BeefyState): Promise<Step> {
    return {
      step: 'bridge',
      message: t('Vault-TxnConfirm', { type: t('Bridge-noun') }),
      action: walletActions.bridgeViaCommonInterface(
        quote.input,
        quote.output,
        quote.fee,
        quote.config.chains[quote.input.token.chainId].bridge
      ),
      pending: false,
    };
  }
}
