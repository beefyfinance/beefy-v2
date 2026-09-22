import { describe, expect, it } from 'vitest';
import type { TokenErc20 } from '../../../../entities/token.ts';
import {
  arcNative,
  arcUsdc,
  baseNative,
  baseWeth,
  depositRowTokens,
  expectOneRowPerBalance,
  makeState,
  withdrawRowTokens,
} from '../../helpers/same-balance.test-helper.ts';
import { SwapAggregator } from '../../swap/SwapAggregator.ts';
import { WNativeSwapProvider } from '../../swap/wnative/WNativeSwapProvider.ts';
import type { ZapTransactHelpers } from '../IStrategy.ts';
import { SingleStrategy } from './SingleStrategy.ts';

const state = makeState();
const swapAggregator = new SwapAggregator([new WNativeSwapProvider()]);

function makeStrategy(chainId: 'arc' | 'base', depositToken: TokenErc20) {
  const helpers = {
    vault: {
      id: `${chainId}-single`,
      type: 'standard',
      chainId,
      assetIds: [depositToken.id],
      depositTokenAddress: depositToken.address,
    },
    vaultType: { id: 'standard', depositToken },
    zap: { manager: '0x000000000000000000000000000000000000beef', router: '0x01' },
    swapAggregator,
    getState: () => state,
  } as unknown as ZapTransactHelpers;

  return new SingleStrategy({ strategyId: 'single' }, helpers);
}

describe('SingleStrategy option lists where balanceSharedWithWrapped', () => {
  it('offers the one balance once for deposit, as the erc20 view', async () => {
    const rows = depositRowTokens(await makeStrategy('arc', arcUsdc).fetchDepositOptions());

    expectOneRowPerBalance(state, rows);
    expect(rows).not.toContainEqual(arcNative);
    expect(rows).toContainEqual(arcUsdc);
  });

  it('offers the one balance once for withdraw, as the erc20 view', async () => {
    const rows = withdrawRowTokens(await makeStrategy('arc', arcUsdc).fetchWithdrawOptions());

    expectOneRowPerBalance(state, rows);
    expect(rows).not.toContainEqual(arcNative);
    expect(rows).toContainEqual(arcUsdc);
  });
});

describe('SingleStrategy option lists where native and wnative are separate balances', () => {
  it('offers both, they are not the same funds', async () => {
    const rows = depositRowTokens(await makeStrategy('base', baseWeth).fetchDepositOptions());

    expect(rows).toContainEqual(baseNative);
    expect(rows).toContainEqual(baseWeth);
  });
});
