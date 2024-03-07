import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import { getWeb3Instance } from '../../instances';
import { ArbitrumNodeInterfaceAbi } from '../../../../../config/abi/ArbitrumNodeInterfaceAbi';
import { viemToWeb3Abi } from '../../../../../helpers/web3';

const fallbackSequencerGasPerByte = new BigNumber('5000');
const gasContractAddress = '0x00000000000000000000000000000000000000C8';
const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const transferCallData =
  '0xa9059cbb00000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab10000000000000000000000000000000000000000000000000000000000000001'; // transfer(wethAddress, 1)

type GasEstimateComponentsResponse = {
  baseFee: string;
  gasEstimate: string;
  gasEstimateForL1: string;
  l1BaseFeeEstimate: string;
};

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
export async function estimateArbitrumSequencerGas(
  chain: ChainEntity,
  callBytes: number
): Promise<BigNumber> {
  if (chain.id !== 'arbitrum') {
    throw new Error('estimateArbitrumSequencerGas: not arbitrum');
  }

  const overheadBytes = 140;
  const dummyCallBytes = callDataLengthBytes(transferCallData);
  const dummyTotalBytes = dummyCallBytes + overheadBytes;
  const realTotalBytes = callBytes + overheadBytes;

  try {
    const web3 = await getWeb3Instance(chain);
    const gasContract = new web3.eth.Contract(
      viemToWeb3Abi(ArbitrumNodeInterfaceAbi),
      gasContractAddress
    );
    const result: GasEstimateComponentsResponse = await gasContract.methods
      .gasEstimateComponents(wethAddress, false, transferCallData)
      .call({
        from: wethAddress,
      });
    const l1Gas = new BigNumber(result.gasEstimateForL1);

    return l1Gas.multipliedBy(realTotalBytes).dividedToIntegerBy(dummyTotalBytes);
  } catch (e) {
    console.error('estimateArbitrumSequencerGas - using fallback', e);
    return fallbackSequencerGasPerByte.multipliedBy(realTotalBytes);
  }
}

export function callDataLengthBytes(callData: string): number {
  return (callData.length - 2) / 2;
}
