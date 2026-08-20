import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import type { Abi } from 'viem';
import type { GetContractReturnType } from 'viem';
export type StandardGasPrice = {
    gasPrice: bigint;
};
export type EIP1559GasPrice = {
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
};
export type GasPricing = StandardGasPrice | EIP1559GasPrice;
export interface IGasPricer {
    getGasPrice(): Promise<GasPricing>;
}
export declare class StandardGasPricer implements IGasPricer {
    protected readonly chain: ChainEntity;
    protected readonly minimum: BigNumber;
    protected readonly maximum: BigNumber;
    protected readonly safetyMultiplier: BigNumber;
    constructor(chain: ChainEntity);
    getGasPrice(): Promise<StandardGasPrice>;
}
export declare class EIP1559GasPricer implements IGasPricer {
    protected readonly chain: ChainEntity;
    protected readonly blockCount: number;
    protected readonly percentile: number;
    protected readonly baseMinimum: BigNumber;
    protected readonly baseMaximum: BigNumber;
    protected readonly baseSafetyMultiplier: BigNumber;
    protected readonly priorityMinimum: BigNumber;
    protected readonly priorityMaximum: BigNumber;
    protected readonly prioritySafetyMultiplier: BigNumber;
    constructor(chain: ChainEntity);
    getGasPrice(): Promise<EIP1559GasPrice>;
}
/**
 * Celo has EIP-1559 gas pricing, but no eth_feeHistory RPC method.
 * There is a contract, GasPriceMinimum, that can be used to get the current base fee.
 * @see https://docs.celo.org/protocol/transaction/gas-pricing
 * @see https://docs.celo.org/contract-addresses
 */
export declare class CeloGasPricer implements IGasPricer {
    protected readonly chain: ChainEntity;
    protected readonly gasPriceMinimumAddress: string;
    protected gasPriceMinimumContract: GetContractReturnType | undefined;
    constructor(chain: ChainEntity);
    protected getGasPriceMinimumContract(): {
        address: `0x${string}`;
        abi: Abi;
    };
    /**
     * gasPriceMinimum returns 0.1 gwei
     * eth_gasPrice returns 0.5 gwei
     * eth_maxPriorityFeePerGas returns 2 gwei
     *
     * base of 0.1 gwei goes through fine
     * tips are under 0.5 gwei and most TX do not have tips
     */
    getGasPrice(): Promise<EIP1559GasPrice>;
}
export declare class GaslessGasPricer implements IGasPricer {
    getGasPrice(): Promise<GasPricing>;
}
export declare function createGasPricer(chain: ChainEntity): IGasPricer;
