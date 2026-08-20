import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenErc20, TokenNative } from '../../../entities/token';
import type { BeefyState } from '../../../store/types';
import type { BeefyAxelarBridgeConfig } from '../../config-types';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types';
import { CommonBridgeProvider } from './CommonBridgeProvider';
export declare class AxelarProvider extends CommonBridgeProvider<BeefyAxelarBridgeConfig> {
    readonly id = "axelar";
    protected fetchBridgeFee(config: BeefyAxelarBridgeConfig, from: ChainEntity, to: ChainEntity, _input: InputTokenAmount<TokenErc20>, state: BeefyState): Promise<TokenAmount<TokenNative>>;
    protected fetchIncomingGasLimit(config: BeefyAxelarBridgeConfig, from: ChainEntity, to: ChainEntity): Promise<BigNumber>;
    protected fetchIncomingGasLimitForArbitrum(config: BeefyAxelarBridgeConfig, from: ChainEntity, to: ChainEntity): Promise<BigNumber>;
}
