import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { FeeHistoryResult } from 'web3-eth';
import { maybeHexToNumber } from '../../../helpers/format';
import { getConfigApi } from '../apis/instances';

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

/**
 * Get the chain id of the web3 instance, and lookup if this chain supports eip1559 via our config
 */
async function isWeb3ConnectedToEIP1559Chain(web3: Web3): Promise<boolean> {
  const configApi = getConfigApi();
  const [configs, chainId] = await Promise.all([
    configApi.fetchChainConfigs(),
    web3.eth.getChainId(),
  ]);
  const chainConfig = configs.find(config => config.chainId === chainId);
  return chainConfig.eip1559;
}

/**
 * This takes the median of the last 5 blocks 20th-percentile priority fees.
 * We can tweak this by:
 * - changing the number of blocks we look at (more = underpay during spike, less = overpay during spike)
 * - changing the % that we look at (higher = more chance to overpay, lower = more chance to underpay)
 * - somehow weigh the fees by how full the previous blocks were
 * - changing the base fee safety multiplier (higher = more chance to overpay, lower = more chance to underpay)
 */
async function getGasPriceEstimate(web3: Web3) {
  const blockCount = 5; // number of past blocks to look at
  const baseFeeSafetyMultiplier = 1.5; // a lot of full blocks after our estimate could increase the required base fee
  const minPriorityFeePerGas = new BigNumber(1_500_000_000); // 1.5 gwei

  const latestBlock = await web3.eth.getBlock('latest', false);
  const feeHistory = await getFeeHistory(web3, blockCount, latestBlock.number, [20]);

  const priorityFees = feeHistory.map(block => block.priorityFeePerGas[0]);
  const medianPriorityFee = medianOf(priorityFees);
  const maxPriorityFeePerGas = BigNumber.max(medianPriorityFee, minPriorityFeePerGas);

  const baseFeePerGas = new BigNumber(latestBlock.baseFeePerGas)
    .multipliedBy(baseFeeSafetyMultiplier)
    .decimalPlaces(0);

  return {
    baseFeePerGas: baseFeePerGas.toString(10),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(10),
    maxFeePerGas: baseFeePerGas.plus(maxPriorityFeePerGas).toString(10),
  };
}

/**
 * Returns {maxPriorityFeePerGas,maxFeePerGas} for EIP1559 or {} otherwise, which can be passed directly to .send()
 */
export async function getGasPriceOptions(web3: Web3) {
  const eip1559 = await isWeb3ConnectedToEIP1559Chain(web3);

  if (eip1559) {
    try {
      const gasPriceEstimate = await getGasPriceEstimate(web3);
      return {
        maxPriorityFeePerGas: gasPriceEstimate.maxPriorityFeePerGas,
        maxFeePerGas: gasPriceEstimate.maxFeePerGas,
      };
    } catch (err) {
      if (
        err &&
        err.message &&
        typeof err.message === 'string' &&
        err.message.includes('eth_feeHistory')
      ) {
        // most likely error is "The method 'eth_feeHistory' does not exist / is not available."
        // this can happen on EIP1559 networks when the user's wallet is out of date
        // we show a more user friendly message instead
        console.error(err);
        throw new Error(
          `EIP-1559 gas fee estimation failed. Please check your wallet and RPC endpoint support EIP-1599.\n\n${err.message}`
        );
      } else {
        throw err;
      }
    }
  }

  return {};
}
