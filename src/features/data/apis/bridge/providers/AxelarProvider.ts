import type { BeefyAxelarBridgeConfig } from '../../config-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
import type { ChainEntity } from '../../../entities/chain';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { BeefyState } from '../../../../../redux-types';
import { getAxelarApi } from '../../instances';
import { selectChainNativeToken } from '../../../selectors/tokens';
import { fromWei } from '../../../../../helpers/big-number';

export class AxelarProvider extends CommonBridgeProvider<BeefyAxelarBridgeConfig> {
  public readonly id = 'axelar' as const;

  protected async fetchBridgeFee(
    config: BeefyAxelarBridgeConfig,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<TokenAmount<TokenNative>> {
    const api = await getAxelarApi();
    const native = selectChainNativeToken(state, from.id);
    const feeEstimate = await api.estimateGasFee(
      from,
      to,
      config.chains[to.id].gasLimits.incoming,
      config.chains[from.id].bridge,
      config.chains[to.id].bridge
    );

    return {
      token: native,
      amount: fromWei(feeEstimate, native.decimals),
    };
  }
}
