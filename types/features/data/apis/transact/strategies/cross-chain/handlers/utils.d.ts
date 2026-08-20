import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../../entities/token';
import type { OrderOutput, ZapStep } from '../../../zap/types';
/**
 * Self-transfer of the bridge token on the zap router; reverts if balance < minAmount.
 * Inserted between source handler steps and the CCTP burn to guard against slippage drift.
 */
export declare function buildBalanceCheckZapStep(bridgeTokenAddress: string, zapRouter: string, minAmount: string): ZapStep;
/** Extract bridge-token minOutputAmount from handler orderOutputs; throws if missing. */
export declare function findBridgeTokenMin(orderOutputs: OrderOutput[], bridgeToken: TokenEntity): BigNumber;
