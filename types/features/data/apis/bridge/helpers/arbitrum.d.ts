import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
/**
 * You pay for the sequencer by using more gas on L2
 * The extra gas is calculated from the size of the transaction data and current L1 gas prices,
 * which is translated in to an amount of gas on the L2, using the current L2 gas price.
 *
 * Since we can't estimate the real bridge in tx, we pass a dummy tx to the gas helper contract,
 * and use the l1 gas estimate from that to estimate the extra l2 gas we need for the bridge tx.
 * This will be an overestimate, as the actual cost is based on compressed tx data.
 *
 * The above is vastly simplified, see https://docs.arbitrum.io/devs-how-tos/how-to-estimate-gas
 */
export declare function estimateArbitrumSequencerGas(chain: ChainEntity, callBytes: number): Promise<BigNumber>;
export declare function callDataLengthBytes(callData: string): number;
