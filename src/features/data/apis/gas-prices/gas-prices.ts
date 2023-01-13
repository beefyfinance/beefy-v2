import { ChainEntity } from '../../entities/chain';
import { EIP1559GasConfig, GasConfig, StandardGasConfig } from '../config-types';
import { getWeb3Instance } from '../instances';
import { BigNumber } from 'bignumber.js';
import {
  BIG_MAX_UINT256,
  BIG_ONE,
  BIG_ZERO,
  compareBigNumber,
} from '../../../../helpers/big-number';
import { itemAtPercentile, sortWith } from '../../utils/array-utils';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

export type StandardGasPrice = {
  gasPrice: string;
};

export type EIP1559GasPrice = {
  baseFeePerGas: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
};

export type GasPricing = StandardGasPrice | EIP1559GasPrice;

function clamp(value: BigNumber, min: BigNumber, max: BigNumber): BigNumber {
  return value.isLessThan(min) ? min : value.isGreaterThan(max) ? max : value;
}

function multiplyAndClamp(
  value: BigNumber,
  multiplier: BigNumber,
  min: BigNumber,
  max: BigNumber
): BigNumber {
  return clamp(value.multipliedBy(multiplier).decimalPlaces(0), min, max);
}

function multiplyAndClampToString(
  value: BigNumber,
  multiplier: BigNumber,
  min: BigNumber,
  max: BigNumber
): string {
  return multiplyAndClamp(value, multiplier, min, max).toString(10);
}

export interface IGasPricer {
  getGasPrice(): Promise<GasPricing>;
}

export class StandardGasPricer implements IGasPricer {
  protected readonly minimum: BigNumber;
  protected readonly maximum: BigNumber;
  protected readonly safetyMultiplier: BigNumber;

  constructor(protected readonly chain: ChainEntity) {
    const gas = chain.gas as StandardGasConfig;
    this.minimum = 'minimum' in gas && gas.minimum ? new BigNumber(gas.minimum) : BIG_ZERO;
    this.maximum = 'maximum' in gas && gas.maximum ? new BigNumber(gas.maximum) : BIG_MAX_UINT256;
    this.safetyMultiplier = BIG_ONE.plus(
      'safetyMargin' in gas && gas.safetyMargin ? new BigNumber(gas.safetyMargin) : BIG_ZERO
    );
  }

  async getGasPrice(): Promise<StandardGasPrice> {
    const web3 = await getWeb3Instance(this.chain);
    const gasPrice = await web3.eth.getBeefyGasPrice();

    return {
      gasPrice: multiplyAndClampToString(
        gasPrice,
        this.safetyMultiplier,
        this.minimum,
        this.maximum
      ),
    };
  }
}

export class EIP1559GasPricer implements IGasPricer {
  protected readonly blockCount: number;
  protected readonly percentile: number;
  protected readonly baseMinimum: BigNumber;
  protected readonly baseMaximum: BigNumber;
  protected readonly baseSafetyMultiplier: BigNumber;
  protected readonly priorityMinimum: BigNumber;
  protected readonly priorityMaximum: BigNumber;
  protected readonly prioritySafetyMultiplier: BigNumber;

  constructor(protected readonly chain: ChainEntity) {
    const gas = chain.gas as EIP1559GasConfig;

    this.blockCount = gas.blocks;
    this.percentile = gas.percentile;

    this.baseMinimum =
      'baseMinimum' in gas && gas.baseMinimum ? new BigNumber(gas.baseMinimum) : BIG_ZERO;
    this.baseMaximum =
      'baseMaximum' in gas && gas.baseMaximum ? new BigNumber(gas.baseMaximum) : BIG_MAX_UINT256;
    this.baseSafetyMultiplier = BIG_ONE.plus(
      'baseSafetyMargin' in gas && gas.baseSafetyMargin
        ? new BigNumber(gas.baseSafetyMargin)
        : BIG_ZERO
    );

    this.priorityMinimum =
      'priorityMinimum' in gas && gas.priorityMinimum
        ? new BigNumber(gas.priorityMinimum)
        : BIG_ZERO;
    this.priorityMaximum =
      'priorityMaximum' in gas && gas.priorityMaximum
        ? new BigNumber(gas.priorityMaximum)
        : BIG_MAX_UINT256;
    this.prioritySafetyMultiplier = BIG_ONE.plus(
      'prioritySafetyMargin' in gas && gas.prioritySafetyMargin
        ? new BigNumber(gas.prioritySafetyMargin)
        : BIG_ZERO
    );
  }

  async getGasPrice(): Promise<EIP1559GasPrice> {
    const web3 = await getWeb3Instance(this.chain);
    const feeHistory = await web3.eth.getBeefyFeeHistory(this.blockCount, 'latest', [
      this.percentile,
    ]);

    const sortedBaseFees = sortWith(feeHistory.baseFeePerGas, compareBigNumber);
    const initialBaseFee = itemAtPercentile(sortedBaseFees, this.percentile);
    const sortedPriorityFees = sortWith(
      feeHistory.reward.map(reward => reward[0]),
      compareBigNumber
    );
    const initialPriorityFee = itemAtPercentile(sortedPriorityFees, this.percentile);

    const baseFee = multiplyAndClamp(
      initialBaseFee,
      this.baseSafetyMultiplier,
      this.baseMinimum,
      this.baseMaximum
    );

    const priorityFee = multiplyAndClamp(
      initialPriorityFee,
      this.prioritySafetyMultiplier,
      this.priorityMinimum,
      this.priorityMaximum
    );

    return {
      baseFeePerGas: baseFee.toString(10),
      maxPriorityFeePerGas: priorityFee.toString(10),
      maxFeePerGas: baseFee.plus(priorityFee).toString(10),
    };
  }
}

/**
 * Celo has EIP-1559 gas pricing, but no eth_feeHistory RPC method.
 * There is a contract, GasPriceMinimum, that can be used to get the current base fee.
 * @see https://docs.celo.org/protocol/transaction/gas-pricing
 * @see https://docs.celo.org/contract-addresses
 */
export class CeloGasPricer implements IGasPricer {
  protected readonly gasPriceMinimumAddress: string = '0xDfca3a8d7699D8bAfe656823AD60C17cb8270ECC';
  protected gasPriceMinimumContract: Contract | null = null;

  constructor(protected readonly chain: ChainEntity) {}

  protected getGasPriceMinimumContract(web3: Web3): Contract {
    if (!this.gasPriceMinimumContract) {
      this.gasPriceMinimumContract = new web3.eth.Contract(
        [
          {
            type: 'function',
            stateMutability: 'view',
            payable: false,
            outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
            name: 'gasPriceMinimum',
            inputs: [],
            constant: true,
          },
        ],
        this.gasPriceMinimumAddress
      );
    }

    return this.gasPriceMinimumContract;
  }

  /**
   * gasPriceMinimum returns 0.1 gwei
   * eth_gasPrice returns 0.5 gwei
   * eth_maxPriorityFeePerGas returns 2 gwei
   *
   * base of 0.1 gwei goes through fine
   * tips are under 0.5 gwei and most TX do not have tips
   */
  async getGasPrice(): Promise<EIP1559GasPrice> {
    const web3 = await getWeb3Instance(this.chain);
    const gasPriceMinimumContract = this.getGasPriceMinimumContract(web3);
    const minimumGasPrice = await gasPriceMinimumContract.methods.gasPriceMinimum().call();

    const baseFee = new BigNumber(minimumGasPrice); // 0.1 gwei
    const priorityFee = baseFee.dividedToIntegerBy(10); // 0.01 gwei

    return {
      baseFeePerGas: baseFee.toString(10),
      maxPriorityFeePerGas: priorityFee.toString(10),
      maxFeePerGas: baseFee.plus(priorityFee).toString(10),
    };
  }
}

const classByType: Readonly<Record<GasConfig['type'], new (chain: ChainEntity) => IGasPricer>> = {
  standard: StandardGasPricer,
  eip1559: EIP1559GasPricer,
  celo: CeloGasPricer,
} as const;

export function createGasPricer(chain: ChainEntity): IGasPricer {
  const GasPricesClass = classByType[chain.gas.type];
  return new GasPricesClass(chain);
}
