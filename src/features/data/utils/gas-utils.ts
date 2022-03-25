import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import { FeeHistoryResult } from 'web3-eth';
import { maybeHexToNumber } from '../../../helpers/format';
import { getConfigApi } from '../apis/instances';

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
async function getFeeHistory(web3: Web3, blockCount: number, percentiles: number[]) {
  return formatFeeHistory(await web3.eth.getFeeHistory(blockCount, 'latest', percentiles));
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
 * This takes the average of the last 5 blocks 35th-percentile priority fees.
 * We can tweak this by:
 * - changing the number of blocks we look at (more = underpay during spike, less = overpay during spike)
 * - changing the % that we look at (higher = more chance to overpay, lower = more chance to underpay)
 * - somehow weigh the fees by how full the previous blocks were
 * - changing the base fee safety multiplier (higher = more chance to overpay, lower = more chance to underpay)
 */
async function getGasPriceEstimate(web3: Web3) {
  const blockCount = 5; // number of past blocks to look at
  const baseFeeSafetyMultiplier = 1.5; // a lot of full blocks after our estimate could increase the required base fee

  const [feeHistory, pendingBlock] = await Promise.all([
    getFeeHistory(web3, blockCount, [35]),
    web3.eth.getBlock('latest', false),
  ]);
  const priorityFees = feeHistory.map(block => block.priorityFeePerGas[0]);
  const totalPriorityFees = BigNumber.sum(...priorityFees);
  const avgPriorityFee = totalPriorityFees.dividedToIntegerBy(blockCount);
  const baseFeePerGas = new BigNumber(pendingBlock.baseFeePerGas)
    .multipliedBy(baseFeeSafetyMultiplier)
    .decimalPlaces(0);

  return {
    baseFeePerGas: baseFeePerGas.toString(10),
    maxPriorityFeePerGas: avgPriorityFee.toString(10),
    maxFeePerGas: baseFeePerGas.plus(avgPriorityFee).toString(10),
  };
}

/**
 * Returns {maxPriorityFeePerGas,maxFeePerGas} for EIP1559 or {} otherwise, which can be passed directly to .send()
 */
export async function getGasPriceOptions(web3: Web3) {
  const eip1559 = await isWeb3ConnectedToEIP1559Chain(web3);

  if (eip1559) {
    const gasPriceEstimate = await getGasPriceEstimate(web3);
    return {
      maxPriorityFeePerGas: gasPriceEstimate.maxPriorityFeePerGas,
      maxFeePerGas: gasPriceEstimate.maxFeePerGas,
    };
  }

  return {};
}
