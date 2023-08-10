import type { BeefyLayerZeroBridgeConfig } from '../../config-types';
import type { AllowanceTokenAmount, InputTokenAmount } from '../../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './provider-types';
import type { ChainEntity } from '../../../entities/chain';
import { getContract } from '../../../../../helpers/getContract';
import { BeefyLayerZeroBridgeAbi } from '../../../../../config/abi';
import { getWeb3Instance } from '../../instances';
import { fromWeiString, toWeiString } from '../../../../../helpers/big-number';
import type { BeefyState } from '../../../../../redux-types';
import { selectChainNativeToken } from '../../../selectors/tokens';
import { selectBridgeTokenForChainId } from '../../../selectors/bridge';
import type { TokenErc20 } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';
import { walletActions } from '../../../actions/wallet-actions';

export interface BeefyLayerZeroBridgeQuote extends IBridgeQuote<BeefyLayerZeroBridgeConfig> {
  config: BeefyLayerZeroBridgeConfig;
}

export class LayerZeroProvider implements IBridgeProvider<BeefyLayerZeroBridgeConfig> {
  public readonly id = 'layer-zero' as const;

  async fetchQuote(
    config: BeefyLayerZeroBridgeConfig,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    walletAddress: string,
    state: BeefyState
  ): Promise<BeefyLayerZeroBridgeQuote> {
    if (!(from.id in config.chains) || !(to.id in config.chains)) {
      throw new Error(`LayerZero not available for ${from}->${to}.`);
    }

    const web3 = await getWeb3Instance(from);
    const { bridge: bridgeAddress } = config.chains[from.id];
    const { chainId: lzChainId } = config.chains[to.id];

    const contract = getContract(bridgeAddress, web3, BeefyLayerZeroBridgeAbi);
    const inputWei = toWeiString(input.amount, input.token.decimals);

    const feeToken = selectChainNativeToken(state, to.id);
    const feeWei = await contract.methods.bridgeCost(lzChainId, inputWei, walletAddress).call();
    const fee = fromWeiString(feeWei, feeToken.decimals);

    const outputToken = selectBridgeTokenForChainId(state, to.id);
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
      fee: { token: feeToken, amount: fee },
      allowance,
      config,
    };
  }

  async fetchBridgeStep(
    quote: BeefyLayerZeroBridgeQuote,
    t: TFunction,
    state: BeefyState
  ): Promise<Step> {
    return {
      step: 'bridge',
      message: t('Vault-TxnConfirm', { type: t('Bridge-noun') }),
      action: walletActions.bridgeViaLayerZero(
        quote.input,
        quote.output,
        quote.config.chains[quote.output.token.chainId].chainId,
        quote.config.chains[quote.input.token.chainId].bridge
      ),
      pending: false,
    };
  }
}
