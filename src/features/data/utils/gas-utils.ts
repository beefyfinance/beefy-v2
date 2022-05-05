import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { FeeHistoryResult } from 'web3-eth';
import { maybeHexToNumber } from '../../../helpers/format';

function medianOf(numbers: BigNumber[]): BigNumber {
  const sortedNumbers = numbers.slice().sort((a, b) => a.comparedTo(b));
  const i = Math.floor((sortedNumbers.length - 1) / 2);
  return sortedNumbers[i];
}

/**
 * Formats data to per-block object, and converts hex strings to BigNumber instances
 */
function formatFeeHistory(history: FeeHistoryResult) {
  const oldestBlock = maybeHexToNumber(history.oldestBlock);
  const blocks = [];

  for (let i = 0; i < history.gasUsedRatio.length; ++i) {
    blocks.push({
      blockNo: oldestBlock + i,
      gasUsedRatio: history.gasUsedRatio[i],
      baseFeePerGas: new BigNumber(history.baseFeePerGas[i]),
      priorityFeePerGas: history.reward[i].map(reward => new BigNumber(reward)),
    });
  }

  return blocks;
}

/**
 * Helper method to format the return value of web3.eth.getFeeHistory
 */
async function getFeeHistory(
  web3: Web3,
  blockCount: number,
  lastBlock: number,
  percentiles: number[]
) {
  return formatFeeHistory(await web3.eth.getFeeHistory(blockCount, lastBlock, percentiles));
}

async function estimatePriorityGasFee(web3: Web3, blockNumber: number): Promise<BigNumber> {
  try {
    // Attempt to use median of last 5 blocks priority fees
    const feeHistory = await getFeeHistory(web3, 5, blockNumber, [20]);
    const priorityFees = feeHistory.map(block => block.priorityFeePerGas[0]);
    return medianOf(priorityFees);
  } catch (err) {
    // Fallback to using legacy gas price
    console.warn('EIP-1559 network without eth_feeHistory support.', err);
    return new BigNumber(await web3.eth.getGasPrice());
  }
}

export async function getGasPriceOptions(web3: Web3) {
  const latestBlock = await web3.eth.getBlock('latest', false);

  if (latestBlock.baseFeePerGas) {
    const baseFeeSafetyMultiplier = 1.5; // a lot of full blocks after our estimate could increase the required base fee
    const minPriorityFeePerGas = new BigNumber(1_500_000_000); // 1.5 gwei
    const estimatePriorityFeePerGas = await estimatePriorityGasFee(web3, latestBlock.number);
    const maxPriorityFeePerGas = BigNumber.max(estimatePriorityFeePerGas, minPriorityFeePerGas);

    const baseFeePerGas = new BigNumber(latestBlock.baseFeePerGas)
      .multipliedBy(baseFeeSafetyMultiplier)
      .decimalPlaces(0);

    return {
      baseFeePerGas: baseFeePerGas.toString(10),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(10),
      maxFeePerGas: baseFeePerGas.plus(maxPriorityFeePerGas).toString(10),
    };
  }

  return {};
}
