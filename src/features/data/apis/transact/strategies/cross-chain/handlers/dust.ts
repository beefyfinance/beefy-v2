import { uniqBy } from 'lodash-es';
import type { TokenEntity } from '../../../../../entities/token.ts';
import { pickTokens, uniqueTokens } from '../../../helpers/tokens.ts';
import { getTokenAddress } from '../../../helpers/zap.ts';
import {
  isZapQuoteStepSwap,
  type InputTokenAmount,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepSwapAggregator,
} from '../../../transact-types.ts';
import type { OrderOutput } from '../../../zap/types.ts';

// ===== Dust Output Helper Types and Functions =====

/**
 * Configuration for deposit destination dust outputs.
 * Used when building ZapPayload for CircleBeefyZapReceiver on dest chain.
 */
export type DepositDestConfig = {
  context: 'deposit-dest';
  pickTokensFrom: {
    outputs: TokenAmount[];
    inputs: InputTokenAmount[];
    returned: TokenAmount[];
  };
  bridgeToken: TokenEntity;
  swapSteps: ZapQuoteStep[];
};

/**
 * Configuration for deposit source dust outputs.
 * Used when building UserlessZapRequest for source chain (bridge-token burn case).
 */
export type DepositSourceConfig = {
  context: 'deposit-source';
  inputs: InputTokenAmount[];
  bridgeToken: TokenEntity;
  swapStep?: ZapQuoteStepSwapAggregator;
};

/**
 * Configuration for withdraw destination dust outputs.
 * Used when building ZapPayload for destination swap (non-bridge-token output).
 */
export type WithdrawDestConfig = {
  context: 'withdraw-dest';
  bridgeToken: TokenEntity;
  swapSteps: ZapQuoteStep[];
};

/**
 * Configuration for withdraw source dust outputs.
 * Used when building UserlessZapRequest for vault chain (withdrawal flow).
 */
export type WithdrawSourceConfig = {
  context: 'withdraw-source';
  inputs: InputTokenAmount[];
  bridgeToken: TokenEntity;
  withdrawQuote: {
    outputs: TokenAmount[];
    inputs: InputTokenAmount[];
    returned: TokenAmount[];
    steps: ZapQuoteStep[];
  };
};

/**
 * Discriminated union for all dust output building contexts.
 */
export type IntermediateTokenConfig =
  | DepositDestConfig
  | DepositSourceConfig
  | WithdrawDestConfig
  | WithdrawSourceConfig;

/**
 * Collects all intermediate tokens that should be returned as dust outputs.
 * Uses discriminated union to handle different contexts type-safely.
 *
 * Each context has different token sources:
 * - deposit-dest: pickTokens + bridgeToken + swapSteps + zapSteps
 * - deposit-source: inputs + bridgeToken + optional swapStep + zapSteps
 * - withdraw-dest: bridgeToken + swapSteps + zapSteps
 * - withdraw-source: inputs + bridgeToken + withdrawQuote + zapSteps
 *
 * @param config - Configuration with context-specific token sources
 * @returns Array of unique TokenEntity objects (deduplicated by chainId + address)
 */
export function collectIntermediateTokens(config: IntermediateTokenConfig): TokenEntity[] {
  const tokens: TokenEntity[] = [];

  switch (config.context) {
    case 'deposit-dest': {
      // pickTokens(outputs, inputs, returned)
      const pickedTokens = pickTokens(
        config.pickTokensFrom.outputs,
        config.pickTokensFrom.inputs,
        config.pickTokensFrom.returned
      );
      tokens.push(...pickedTokens);

      // Bridge token (arrives from bridge)
      tokens.push(config.bridgeToken);

      // Swap step tokens
      config.swapSteps.filter(isZapQuoteStepSwap).forEach(swapStep => {
        tokens.push(swapStep.fromToken);
        tokens.push(swapStep.toToken);
      });

      break;
    }

    case 'deposit-source': {
      // Input tokens (in case of partial consumption)
      tokens.push(...config.inputs.map(i => i.token));

      // Bridge token (before burn)
      tokens.push(config.bridgeToken);

      // Swap step tokens (if present)
      if (config.swapStep) {
        tokens.push(config.swapStep.fromToken);
        tokens.push(config.swapStep.toToken);
      }

      break;
    }

    case 'withdraw-dest': {
      // Bridge token
      tokens.push(config.bridgeToken);

      // Swap step tokens
      config.swapSteps.filter(isZapQuoteStepSwap).forEach(swapStep => {
        tokens.push(swapStep.fromToken);
        tokens.push(swapStep.toToken);
      });

      break;
    }

    case 'withdraw-source': {
      // Input tokens (mooToken)
      tokens.push(...config.inputs.map(i => i.token));

      // Bridge token (before burn)
      tokens.push(config.bridgeToken);

      // Withdraw quote tokens
      const pickedTokens = pickTokens(
        config.withdrawQuote.outputs,
        config.withdrawQuote.inputs,
        config.withdrawQuote.returned
      );
      tokens.push(...pickedTokens);

      // Swap intermediates from withdraw steps
      config.withdrawQuote.steps.filter(isZapQuoteStepSwap).forEach(swapStep => {
        tokens.push(swapStep.fromToken);
        tokens.push(swapStep.toToken);
      });

      break;
    }
  }

  // Return unique tokens (by chainId + address)
  return uniqueTokens(tokens);
}

/**
 * Converts token entities to dust outputs (minOutputAmount='0').
 * Deduplicates by token address.
 *
 * @param tokens - Array of token entities
 * @returns Array of OrderOutput with minOutputAmount='0'
 */
export function buildDustOutputs(tokens: TokenEntity[]): OrderOutput[] {
  // Convert to OrderOutput with minOutputAmount='0'
  const outputs = tokens.map(token => ({
    token: getTokenAddress(token),
    minOutputAmount: '0',
  }));

  // Deduplicate by token address (uniqBy keeps first occurrence)
  return uniqBy(outputs, output => output.token);
}

/**
 * Merges required outputs and dust outputs, ensuring required outputs take precedence.
 * Deduplicates by token address, keeping the first occurrence (required outputs come first).
 *
 * @param required - Required outputs with proper slippage settings
 * @param dust - Dust outputs with minOutputAmount='0'
 * @returns Merged and deduplicated OrderOutput array
 */
export function mergeOutputs(required: OrderOutput[], dust: OrderOutput[]): OrderOutput[] {
  // Concatenate required first, then dust
  // uniqBy keeps first occurrence, so required outputs take precedence
  return uniqBy(required.concat(dust), output => output.token);
}
