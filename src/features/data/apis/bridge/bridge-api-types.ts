import type { InputTokenAmount } from '../transact/transact-types';
import type { BeefyAnyBridgeConfig } from '../config-types';
import type { ChainEntity } from '../../entities/chain';
import type { BeefyState } from '../../../../redux-types';
import type { IBridgeQuote } from './providers/provider-types';
import type { TokenErc20 } from '../../entities/token';
import type { Step } from '../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';

export interface IBridgeApi {
  fetchQuote<T extends BeefyAnyBridgeConfig>(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<IBridgeQuote<BeefyAnyBridgeConfig>>;

  fetchBridgeStep<T extends BeefyAnyBridgeConfig>(
    quote: IBridgeQuote<T>,
    t: TFunction,
    state: BeefyState
  ): Promise<Step>;
}
