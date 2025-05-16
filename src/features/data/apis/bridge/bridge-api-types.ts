import type { TFunction } from 'react-i18next';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenErc20 } from '../../entities/token.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import type { BeefyState } from '../../store/types.ts';
import type { BeefyAnyBridgeConfig } from '../config-types.ts';
import type { InputTokenAmount } from '../transact/transact-types.ts';
import type { IBridgeQuote } from './providers/provider-types.ts';

export interface IBridgeApi {
  fetchQuote<T extends BeefyAnyBridgeConfig>(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    receiver: string | undefined,
    state: BeefyState
  ): Promise<IBridgeQuote<BeefyAnyBridgeConfig>>;

  fetchBridgeStep<T extends BeefyAnyBridgeConfig>(
    quote: IBridgeQuote<T>,
    t: TFunction,
    state: BeefyState
  ): Promise<Step>;
}
