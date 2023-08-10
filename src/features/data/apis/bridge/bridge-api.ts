import type { IBridgeApi } from './bridge-api-types';
import type { BeefyAnyBridgeConfig, BeefyBridgeConfig } from '../config-types';
import type { InputTokenAmount } from '../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './providers/provider-types';
import { LayerZeroProvider } from './providers/LayerZeroProvider';
import type { ChainEntity } from '../../entities/chain';
import type { BeefyState } from '../../../../redux-types';
import { LayerZeroDummyProvider } from './providers/LayerZeroDummyProvider';
import type { TFunction } from 'react-i18next';
import type { Step } from '../../reducers/wallet/stepper';
import type { TokenErc20 } from '../../entities/token';

type ProviderMap = {
  [K in keyof BeefyBridgeConfig['bridges']]: IBridgeProvider<BeefyBridgeConfig['bridges'][K]>;
};

const providers = {
  'layer-zero': new LayerZeroProvider(),
  'layer-zero-dummy': new LayerZeroDummyProvider(),
} as const satisfies ProviderMap;

export class BridgeApi implements IBridgeApi {
  public async fetchQuote(
    config: BeefyBridgeConfig['bridges'][keyof BeefyBridgeConfig['bridges']],
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    walletAddress: string,
    state: BeefyState
  ): Promise<IBridgeQuote<BeefyAnyBridgeConfig>> {
    if (!providers[config.id]) throw new Error(`Unknown bridge provider: ${config.id}`);

    // asserts the config->provider mapping is correct
    const provider = providers[config.id] as IBridgeProvider<typeof config>;
    return await provider.fetchQuote(config, from, to, input, walletAddress, state);
  }

  async fetchBridgeStep<T extends BeefyAnyBridgeConfig>(
    quote: IBridgeQuote<T>,
    t: TFunction,
    state: BeefyState
  ): Promise<Step> {
    if (!providers[quote.id]) throw new Error(`Unknown bridge provider: ${quote.id}`);

    // asserts the config->provider mapping is correct
    const provider: IBridgeProvider<BeefyAnyBridgeConfig> = providers[quote.id];
    return provider.fetchBridgeStep(quote, t, state);
  }
}
