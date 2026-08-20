import type { TFunction } from 'react-i18next';
import type { ChainEntity } from '../../entities/chain';
import type { TokenErc20 } from '../../entities/token';
import type { Step } from '../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../store/types';
import type { BeefyAnyBridgeConfig } from '../config-types';
import type { InputTokenAmount } from '../transact/transact-types';
import type { IBridgeApi } from './bridge-api-types';
import type { IBridgeQuote } from './providers/provider-types';
export declare class BridgeApi implements IBridgeApi {
    fetchQuote<T extends BeefyAnyBridgeConfig>(config: T, from: ChainEntity, to: ChainEntity, input: InputTokenAmount<TokenErc20>, receiver: string | undefined, state: BeefyState): Promise<IBridgeQuote<T>>;
    fetchBridgeStep<T extends BeefyAnyBridgeConfig>(quote: IBridgeQuote<T>, t: TFunction, state: BeefyState): Promise<Step>;
}
