import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain';
import type { IAxelarApi } from './axelar-api-types';
import type { AxelarChain, AxelarGasToken } from './axelar-sdk-types';
export declare class AxelarApi implements IAxelarApi {
    estimateGasFee(sourceChain: ChainEntity, destinationChain: ChainEntity, gasLimit: BigNumber, sourceAddress: string, destinationAddress: string): Promise<BigNumber>;
    protected chainEntityToEvmChain(chain: ChainEntity): AxelarChain;
    protected chainEntityToGasToken(axelarChain: AxelarChain): AxelarGasToken;
}
