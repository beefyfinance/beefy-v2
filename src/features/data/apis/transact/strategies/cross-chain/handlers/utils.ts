import type BigNumber from 'bignumber.js';
import { type Address, encodeFunctionData } from 'viem';
import { ERC20Abi } from '../../../../../../../config/abi/ERC20Abi.ts';
import { fromWei } from '../../../../../../../helpers/big-number.ts';
import type { TokenEntity } from '../../../../../entities/token.ts';
import type { OrderOutput, ZapStep } from '../../../zap/types.ts';

/**
 * Build a ZapStep that does a self-transfer of the bridge token on the zap
 * router.
 *
 * Acts as a minimum-balance assertion: if the router holds less than
 * `minAmount`, the ERC20 transfer reverts, failing the tx on the source chain
 * rather than letting an under-funded CCTP burn go through to the destination
 * chain.
 *
 * The orchestrator inserts this step between the source handler's zap steps
 * and the CCTP burn step to guard against slippage / fee drift between
 * quote and execution.
 */
export function buildBalanceCheckZapStep(
  bridgeTokenAddress: string,
  zapRouter: string,
  minAmount: string
): ZapStep {
  const data = encodeFunctionData({
    abi: ERC20Abi,
    functionName: 'transfer',
    args: [zapRouter as Address, BigInt(minAmount)],
  });

  return {
    target: bridgeTokenAddress,
    value: '0',
    data,
    tokens: [],
  };
}

/**
 * Extract the bridge-token minimum amount from a source handler's
 * `orderOutputs`. Throws if the handler didn't include the bridge token
 */
export function findBridgeTokenMin(
  orderOutputs: OrderOutput[],
  bridgeToken: TokenEntity
): BigNumber {
  const entry = orderOutputs.find(o => o.token.toLowerCase() === bridgeToken.address.toLowerCase());
  if (!entry) {
    throw new Error(
      `[cross-chain] Source handler did not expose a bridge-token output (${bridgeToken.address})`
    );
  }
  return fromWei(BigInt(entry.minOutputAmount), bridgeToken.decimals);
}
