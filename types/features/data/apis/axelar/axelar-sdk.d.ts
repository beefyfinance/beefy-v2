import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain';
import type { AxelarChain, AxelarGasToken, DestinationToken, EstimateL1FeeParams, GetFeesRequest, GetFeesResponse, IAxelarSDK, L2Type, SourceToken, Token } from './axelar-sdk-types';
import type { Hex } from 'viem';
/**
 * Slimmed down copy of the Axelar SDK with only a estimateGasFee analog implemented.
 */
export declare class AxelarSDK implements IAxelarSDK {
    protected destinationChain: ChainEntity;
    constructor(destinationChain: ChainEntity);
    estimateGasFee(sourceChainId: AxelarChain, sourceContractAddress: string, sourceChainTokenSymbol: AxelarGasToken, destinationChainId: AxelarChain, destinationContractAddress: string, gasLimit: BigNumber, executeData: Hex, gasMultiplier?: number | 'auto', 
    /** in wei */
    minDestinationGasPriceWei?: BigNumber): Promise<BigNumber>;
    protected calculateL1FeeForDestL2(destChainId: AxelarChain, destToken: DestinationToken, executeData: Hex, sourceToken: SourceToken, ethereumToken: Token, actualGasMultiplier: number, l2Type: L2Type): Promise<[BigNumber, BigNumber]>;
    protected getFees(request: Omit<GetFeesRequest, 'method'>): Promise<{
        baseFee: BigNumber;
        expressFee: BigNumber | undefined;
        sourceToken: import("./axelar-sdk-types").NativeToken;
        executeGasMultiplier: number;
        destToken: DestinationToken;
        l2_type: L2Type;
        ethereumToken: Token;
        apiResponse: GetFeesResponse;
        success: boolean;
        expressSupported: boolean;
    }>;
    /** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/libs/fee/getL1Fee.ts */
    estimateL1GasFee(params: EstimateL1FeeParams): Promise<BigNumber>;
    getOptimismL1Fee(estimateL1FeeParams: EstimateL1FeeParams): Promise<BigNumber>;
}
