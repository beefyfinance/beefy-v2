import { uniqBy } from 'lodash-es';
import type { TokenEntity } from '../../../../../entities/token.ts';
import { pickTokens, uniqueTokens } from '../../../helpers/tokens.ts';
import { getTokenAddress } from '../../../helpers/zap.ts';
import {
  isZapQuoteStepSwap,
  type InputTokenAmount,
  type TokenAmount,
  type ZapQuoteStep,
} from '../../../transact-types.ts';
import type { OrderOutput } from '../../../zap/types.ts';

export type IntermediateTokenConfig = {
  bridgeToken: TokenEntity;
  inputs?: InputTokenAmount[];
  picks?: { outputs: TokenAmount[]; inputs: InputTokenAmount[]; returned: TokenAmount[] };
  swapSteps?: ZapQuoteStep[];
};

/** Collect tokens to emit as dust outputs (min=0 router refunds). */
export function collectIntermediateTokens(config: IntermediateTokenConfig): TokenEntity[] {
  const tokens: TokenEntity[] = [config.bridgeToken];

  if (config.inputs) {
    tokens.push(...config.inputs.map(i => i.token));
  }

  if (config.picks) {
    tokens.push(...pickTokens(config.picks.outputs, config.picks.inputs, config.picks.returned));
  }

  if (config.swapSteps) {
    config.swapSteps.filter(isZapQuoteStepSwap).forEach(swapStep => {
      tokens.push(swapStep.fromToken);
      tokens.push(swapStep.toToken);
    });
  }

  return uniqueTokens(tokens);
}

export function buildDustOutputs(tokens: TokenEntity[]): OrderOutput[] {
  const outputs = tokens.map(token => ({
    token: getTokenAddress(token),
    minOutputAmount: '0',
  }));
  return uniqBy(outputs, output => output.token);
}

export function mergeOutputs(required: OrderOutput[], dust: OrderOutput[]): OrderOutput[] {
  return uniqBy(required.concat(dust), output => output.token);
}
