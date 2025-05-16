import type { TFunction } from 'react-i18next';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenErc20 } from '../../entities/token.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import type { BeefyState } from '../../store/types.ts';
import type { BeefyAnyBridgeConfig, BeefyBridgeIdToConfig } from '../config-types.ts';
import type { InputTokenAmount } from '../transact/transact-types.ts';
import type { IBridgeApi } from './bridge-api-types.ts';
import { AxelarProvider } from './providers/AxelarProvider.ts';
import { ChainlinkProvider } from './providers/ChainlinkProvider.ts';
import { LayerZeroProvider } from './providers/LayerZeroProvider.ts';
import { OptimismProvider } from './providers/OptimismProvider.ts';
import type { IBridgeProvider, IBridgeQuote } from './providers/provider-types.ts';

type ProviderMap = {
  [K in BeefyAnyBridgeConfig['id']]: IBridgeProvider<BeefyBridgeIdToConfig<K>>;
};

const providers = {
  'layer-zero': new LayerZeroProvider(),
  optimism: new OptimismProvider(),
  axelar: new AxelarProvider(),
  chainlink: new ChainlinkProvider(),
} as const satisfies ProviderMap;

export class BridgeApi implements IBridgeApi {
  public async fetchQuote<T extends BeefyAnyBridgeConfig>(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    receiver: string | undefined,
    state: BeefyState
  ): Promise<IBridgeQuote<T>> {
    if (!providers[config.id]) {
      throw new Error(`Unknown bridge provider: ${config.id}`);
    }

    // asserts the config->provider mapping is correct
    const provider = providers[config.id] as unknown as IBridgeProvider<T>;
    return await provider.fetchQuote(config, from, to, input, receiver, state);
  }

  async fetchBridgeStep<T extends BeefyAnyBridgeConfig>(
    quote: IBridgeQuote<T>,
    t: TFunction,
    state: BeefyState
  ): Promise<Step> {
    if (!providers[quote.id]) {
      throw new Error(`Unknown bridge provider: ${quote.id}`);
    }

    // asserts the config->provider mapping is correct
    const provider: IBridgeProvider<BeefyAnyBridgeConfig> = providers[quote.id];
    return provider.fetchBridgeStep(quote, t, state);
  }
}
