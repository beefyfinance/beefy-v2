import BigNumber from 'bignumber.js';
import type { TFunction } from 'react-i18next';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper-types';
import type { BeefyState } from '../../../store/types';
import type { BeefyAnyBridgeConfig } from '../../config-types';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types';
import type { IBridgeProvider, IBridgeQuote } from './provider-types';
export declare abstract class CommonBridgeProvider<T extends BeefyAnyBridgeConfig> implements IBridgeProvider<T> {
    abstract readonly id: T['id'];
    fetchQuote(config: T, from: ChainEntity, to: ChainEntity, input: InputTokenAmount<TokenErc20>, receiver: string | undefined, state: BeefyState): Promise<IBridgeQuote<T>>;
    protected fetchAmountLimit(bridgeAddress: string, chain: ChainEntity, direction: 'incoming' | 'outgoing', state: BeefyState): Promise<{
        current: BigNumber;
        max: BigNumber;
    }>;
    protected fetchOutgoingGasLimit(config: T, from: ChainEntity, to: ChainEntity, input: TokenAmount<TokenErc20>, fee: TokenAmount<TokenNative>, state: BeefyState): Promise<BigNumber>;
    protected fetchBridgeFee(config: T, from: ChainEntity, to: ChainEntity, input: InputTokenAmount<TokenErc20>, state: BeefyState): Promise<TokenAmount<TokenNative>>;
    fetchBridgeStep(quote: IBridgeQuote<T>, t: TFunction, _state: BeefyState): Promise<Step>;
}
