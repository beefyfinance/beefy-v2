import BigNumber from 'bignumber.js';
import { BIG_ZERO, toWeiFromString } from '../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type {
  AxelarChain,
  AxelarGasToken,
  DestinationToken,
  EstimateL1FeeParams,
  GetFeesRequest,
  GetFeesResponse,
  IAxelarSDK,
  L2Type,
  SourceToken,
  Token,
} from './axelar-sdk-types.ts';
import { postJson } from '../../../../helpers/http/http.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';
import type { Hex } from 'viem';

/**
 * Slimmed down copy of the Axelar SDK with only a estimateGasFee analog implemented.
 */
export class AxelarSDK implements IAxelarSDK {
  constructor(protected destinationChain: ChainEntity) {}

  async estimateGasFee(
    sourceChainId: AxelarChain,
    sourceContractAddress: string,
    sourceChainTokenSymbol: AxelarGasToken,
    destinationChainId: AxelarChain,
    destinationContractAddress: string,
    gasLimit: BigNumber,
    executeData: Hex,
    gasMultiplier: number | 'auto' = 'auto',
    /** in wei */
    minDestinationGasPriceWei: BigNumber = BIG_ZERO
  ): Promise<BigNumber> {
    const {
      baseFee,
      // expressFee,
      sourceToken,
      ethereumToken,
      executeGasMultiplier,
      destToken,
      // apiResponse,
      l2_type,
      // success,
      // expressSupported,
    } = await this.getFees({
      sourceChain: sourceChainId,
      sourceContractAddress: destinationContractAddress,
      sourceTokenSymbol: sourceChainTokenSymbol,
      destinationChain: destinationChainId,
      destinationContractAddress: sourceContractAddress,
    });

    const destGasPriceWei = toWeiFromString(destToken.gas_price, destToken.decimals);
    const destGasFeeWei = destGasPriceWei.times(gasLimit);
    const minDestGasFeeWei = minDestinationGasPriceWei.times(gasLimit);

    const srcGasPriceWei = toWeiFromString(sourceToken.gas_price, sourceToken.decimals);
    const srcGasFeeWei = srcGasPriceWei.times(gasLimit);

    const executionFee =
      destGasFeeWei.gt(minDestGasFeeWei) ? srcGasFeeWei : (
        srcGasFeeWei.times(minDestGasFeeWei).dividedToIntegerBy(destGasFeeWei)
      );

    const actualGasMultiplier = gasMultiplier === 'auto' ? executeGasMultiplier : gasMultiplier;

    const executionFeeWithMultiplier =
      actualGasMultiplier > 1 ?
        executionFee.times(actualGasMultiplier).decimalPlaces(0, BigNumber.ROUND_FLOOR)
      : executionFee;

    const [_l1ExecutionFee, l1ExecutionFeeWithMultiplier] = await this.calculateL1FeeForDestL2(
      destinationChainId,
      destToken,
      executeData,
      sourceToken,
      ethereumToken,
      actualGasMultiplier,
      l2_type
    );

    return l1ExecutionFeeWithMultiplier.plus(executionFeeWithMultiplier).plus(baseFee);
  }

  protected async calculateL1FeeForDestL2(
    destChainId: AxelarChain,
    destToken: DestinationToken,
    executeData: Hex,
    sourceToken: SourceToken,
    ethereumToken: Token,
    actualGasMultiplier: number,
    l2Type: L2Type
  ): Promise<[BigNumber, BigNumber]> {
    if (!('l1_gas_price_in_units' in destToken)) {
      return [BIG_ZERO, BIG_ZERO];
    }

    const { l1_gas_price_in_units } = destToken;
    if (!l1_gas_price_in_units) {
      return [BIG_ZERO, BIG_ZERO];
    }

    const l1ExecutionFeeInDestToken: BigNumber = await this.estimateL1GasFee({
      executeData: executeData,
      l1GasPrice: destToken.l1_gas_price_in_units,
      l1GasOracleAddress: destToken.l1_gas_oracle_address,
      destChain: destChainId,
      l2Type,
    });

    // Convert the L1 execution fee to the source token
    const srcTokenPrice = sourceToken.token_price.usd;
    const ethTokenPrice = ethereumToken.token_price.usd;
    const ethToSrcTokenPriceRatio = ethTokenPrice / srcTokenPrice;
    const l1ExecutionFee = l1ExecutionFeeInDestToken
      .times(ethToSrcTokenPriceRatio)
      .shiftedBy(destToken.decimals - sourceToken.decimals)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);

    // Calculate the L1 execution fee with the gas multiplier
    const l1ExecutionFeeWithMultiplier = l1ExecutionFee
      .times(actualGasMultiplier)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);

    return [l1ExecutionFee, l1ExecutionFeeWithMultiplier];
  }

  protected async getFees(request: Omit<GetFeesRequest, 'method'>) {
    const url = `https://api.gmp.axelarscan.io/`;
    const body: GetFeesRequest = {
      method: 'getFees',
      ...request,
    };

    const response = await postJson<GetFeesResponse>({
      url,

      headers: {
        'Content-Type': 'application/json',
      },
      init: { mode: 'cors' },
      body: JSON.stringify(body),
    });

    const {
      source_base_fee_string,
      source_token,
      ethereum_token,
      destination_native_token,
      express_fee_string,
      express_supported,
      l2_type,
      execute_gas_multiplier,
    } = response.result;
    const baseFee = toWeiFromString(source_base_fee_string, source_token.decimals);
    const expressFee =
      express_fee_string ? toWeiFromString(express_fee_string, source_token.decimals) : undefined;

    return {
      baseFee,
      expressFee,
      sourceToken: source_token,
      executeGasMultiplier: parseFloat(execute_gas_multiplier.toFixed(2)),
      destToken: destination_native_token,
      l2_type,
      ethereumToken: ethereum_token,
      apiResponse: response,
      success: true,
      expressSupported: express_supported,
    };
  }

  /** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/libs/fee/getL1Fee.ts */
  async estimateL1GasFee(params: EstimateL1FeeParams): Promise<BigNumber> {
    const { l1GasOracleAddress } = params;
    const realL1GasOracleAddress =
      l1GasOracleAddress || '0x420000000000000000000000000000000000000F';

    switch (params.l2Type) {
      case 'op':
        return this.getOptimismL1Fee({
          ...params,
          l1GasOracleAddress: realL1GasOracleAddress,
        });
      // RPC clients for Arbitrum and Mantle include both L1 and L2 components in gasLimit.
      case 'mantle':
      case 'arb':
      default:
        return BIG_ZERO;
    }
  }

  async getOptimismL1Fee(estimateL1FeeParams: EstimateL1FeeParams) {
    const { executeData, l1GasOracleAddress } = estimateL1FeeParams;

    const gasOracleAbi = [
      {
        inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
        name: 'getL1Fee',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const satisfies Abi;

    const contract = fetchContract(l1GasOracleAddress, gasOracleAbi, this.destinationChain.id);
    const result = await contract.read.getL1Fee([executeData]);

    return new BigNumber(result.toString(10));
  }
}
