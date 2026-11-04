import { fromWei } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import { selectChainNativeToken } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getAxelarApi } from '../../axelar/api.ts';
import type { BeefyAxelarBridgeConfig } from '../../config-types.ts';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types.ts';
import { CommonBridgeProvider } from './CommonBridgeProvider.ts';

export class AxelarProvider extends CommonBridgeProvider<BeefyAxelarBridgeConfig> {
  public readonly id = 'axelar';

  protected async fetchBridgeFee(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity,
    _input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    if (!config.chains[from.id] || !config.chains[to.id]) {
      throw new Error(`bridge '${this.id}' not available for ${from.id}->${to.id}.`);
    }
    const api = await getAxelarApi();
    const native = selectChainNativeToken(state, from.id);
    const feeEstimate = await api.estimateGasFee(from, to);

    return {
      token: native,
      amount: fromWei(feeEstimate, native.decimals),
    };
  }
}
