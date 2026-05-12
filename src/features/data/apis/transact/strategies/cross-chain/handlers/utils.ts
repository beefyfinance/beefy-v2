import type BigNumber from 'bignumber.js';
import { type Address, encodeFunctionData } from 'viem';
import { ERC20Abi } from '../../../../../../../config/abi/ERC20Abi.ts';
import { fromWei } from '../../../../../../../helpers/big-number.ts';
import type { TokenEntity } from '../../../../../entities/token.ts';
import type { OrderOutput, ZapStep } from '../../../zap/types.ts';

/**
 * Self-transfer of the bridge token on the zap router; reverts if balance < minAmount.
 * Inserted between source handler steps and the CCTP burn to guard against slippage drift.
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

/** Extract bridge-token minOutputAmount from handler orderOutputs; throws if missing. */
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
