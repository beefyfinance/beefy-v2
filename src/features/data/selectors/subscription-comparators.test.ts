import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { TokenErc20 } from '../entities/token.ts';
import type { TvlBreakdownVault, TvlBreakdownVaultTotal } from './tvl-types.ts';
import type { UnifiedRewardToken } from './rewards.ts';
import type { UnifiedReward } from './user-rewards.ts';
import type { DepositFromVaultEntry, SelectedZapFee } from './transact.ts';
import type { TransactOption, ZapFee } from '../apis/transact/transact-types.ts';
import { SelectionOrder } from '../apis/transact/transact-types.ts';
import { TransactMode } from '../reducers/wallet/transact-types.ts';
import {
  crossChainChainsEqual,
  depositFromVaultEntriesEqual,
  selectedZapFeeEqual,
  selectionRowsEqual,
} from './transact.ts';
import { tvlBreakdownEqual } from './tvl.ts';
import { unifiedRewardsEqual } from './user-rewards.ts';

const nan = () => new BigNumber(NaN);
const bn = (v: number | string) => new BigNumber(v);

const REWARD_TOKEN: UnifiedRewardToken = {
  address: '0xbifi',
  symbol: 'BIFI',
  decimals: 18,
  chainId: 'base',
};

const erc20 = (overrides: Partial<TokenErc20> = {}): TokenErc20 => ({
  type: 'erc20',
  id: 'MOO',
  symbol: 'MOO',
  chainId: 'base',
  oracleId: 'MOO',
  address: '0xmoo',
  decimals: 18,
  buyUrl: undefined,
  website: undefined,
  description: undefined,
  documentation: undefined,
  tags: [],
  ...overrides,
});

const withTotals = (): TvlBreakdownVaultTotal => ({
  underlyingPlatformId: 'aerodrome',
  vaultShare: NaN,
  vaultTvl: nan(),
  underlyingTvl: bn(0),
  vaultType: 'clm',
  totalType: 'clm',
  totalShare: NaN,
  totalTvl: nan(),
});
const withoutTotals = (): TvlBreakdownVault => ({
  underlyingPlatformId: 'aerodrome',
  vaultShare: NaN,
  vaultTvl: nan(),
  underlyingTvl: bn(0),
});

type Case = {
  name: string;
  rebuilt: () => boolean;
  changed: () => boolean;
  sameReference: () => boolean;
};

/** the comparator's own parameter type is captured here, so no row needs a cast to share a table */
function defineCase<T>(
  name: string,
  equal: (a: T, b: T) => boolean,
  build: () => T,
  changed: () => T
): Case {
  return {
    name,
    rebuilt: () => equal(build(), build()),
    changed: () => equal(build(), changed()),
    sameReference: () => {
      const value = build();
      return equal(value, value);
    },
  };
}

const rewards = (apr: number): UnifiedReward[] => [
  { token: REWARD_TOKEN, amount: nan(), apr, price: nan(), active: true },
];

const cases: Case[] = [
  defineCase('tvlBreakdownEqual (concentrated shape)', tvlBreakdownEqual, withTotals, () => ({
    ...withTotals(),
    vaultShare: 0.5,
  })),
  defineCase('tvlBreakdownEqual (standard shape)', tvlBreakdownEqual, withoutTotals, () => ({
    ...withoutTotals(),
    underlyingTvl: bn(1),
  })),
  defineCase(
    'unifiedRewardsEqual',
    unifiedRewardsEqual,
    () => rewards(NaN),
    () => rewards(0.1)
  ),
];

describe('the comparators that sit at a subscription', () => {
  it.each(cases)(
    '$name reports a value-equal rebuild as equal, NaN fields included',
    ({ rebuilt }) => expect(rebuilt()).toBe(true)
  );

  it.each(cases)('$name still separates a real change', ({ changed }) =>
    expect(changed()).toBe(false)
  );

  it.each(cases)('$name is reflexive on the same reference', ({ sameReference }) =>
    expect(sameReference()).toBe(true)
  );
});

describe('tvlBreakdownEqual across the union it guards', () => {
  it('separates the concentrated and standard shapes', () => {
    expect(tvlBreakdownEqual(withTotals(), withoutTotals())).toBe(false);
    expect(tvlBreakdownEqual(withoutTotals(), withTotals())).toBe(false);
  });

  it('compares the total row only when it is rendered', () => {
    const a = withTotals();
    expect(tvlBreakdownEqual(a, { ...a, totalTvl: bn(5) })).toBe(false);
    expect(tvlBreakdownEqual(withoutTotals(), withoutTotals())).toBe(true);
  });

  it('handles null and undefined the way a missing breakdown arrives', () => {
    expect(tvlBreakdownEqual(undefined, undefined)).toBe(true);
    expect(tvlBreakdownEqual(null, null)).toBe(true);
    expect(tvlBreakdownEqual(null, undefined)).toBe(false);
    expect(tvlBreakdownEqual(withTotals(), undefined)).toBe(false);
  });
});

describe('unifiedRewardEqual compares its reward token by reference', () => {
  const reward = (token: UnifiedRewardToken): UnifiedReward[] => [
    { token, amount: bn(1), apr: 0.1, price: bn(2), active: true },
  ];

  it('a value-identical token entity from a different instance reports unequal', () => {
    expect(unifiedRewardsEqual(reward(REWARD_TOKEN), reward({ ...REWARD_TOKEN }))).toBe(false);
  });

  it('the same entity reports equal', () => {
    expect(unifiedRewardsEqual(reward(REWARD_TOKEN), reward(REWARD_TOKEN))).toBe(true);
  });

  it('treats an undefined price as distinct from a zero price', () => {
    const priced: UnifiedReward[] = [
      { token: REWARD_TOKEN, amount: bn(1), apr: 0.1, price: bn(0), active: true },
    ];
    const unpriced: UnifiedReward[] = [
      { token: REWARD_TOKEN, amount: bn(1), apr: 0.1, price: undefined, active: true },
    ];
    expect(unifiedRewardsEqual(priced, unpriced)).toBe(false);
    expect(unifiedRewardsEqual(unpriced, unpriced)).toBe(true);
  });
});

describe('the list comparators short-circuit on length before touching an element', () => {
  it('selectionRowsEqual', () => {
    expect(selectionRowsEqual([], [])).toBe(true);
    expect(selectionRowsEqual([], [undefined as never])).toBe(false);
  });

  it('depositFromVaultEntriesEqual', () => {
    expect(depositFromVaultEntriesEqual([], [])).toBe(true);
    expect(depositFromVaultEntriesEqual([], [undefined as never])).toBe(false);
  });

  it('crossChainChainsEqual', () => {
    expect(crossChainChainsEqual([], [])).toBe(true);
    expect(crossChainChainsEqual([], [undefined as never])).toBe(false);
  });

  it('unifiedRewardsEqual', () => {
    expect(unifiedRewardsEqual([], [])).toBe(true);
    expect(unifiedRewardsEqual([], [undefined as never])).toBe(false);
  });
});

describe('depositFromVaultEntryEqual compares every field of a row', () => {
  const row = (): DepositFromVaultEntry => ({
    id: 'selection-1',
    vaultId: 'vault-1',
    order: 0,
    hideIfZeroBalance: false,
    feeCampaign: undefined,
    decimals: 18,
    balance: bn(1),
    balanceUsd: bn(2),
    tokens: [erc20()],
  });

  it('a value-equal row rebuilt from scratch is equal', () => {
    expect(depositFromVaultEntriesEqual([row()], [row()])).toBe(true);
  });

  // Record<keyof T> so a field added to DepositFromVaultEntry fails to compile until covered here
  const mutations: Record<
    keyof DepositFromVaultEntry,
    (r: DepositFromVaultEntry) => DepositFromVaultEntry
  > = {
    id: r => ({ ...r, id: 'selection-2' }),
    vaultId: r => ({ ...r, vaultId: 'vault-2' }),
    order: r => ({ ...r, order: r.order + 1 }),
    hideIfZeroBalance: r => ({ ...r, hideIfZeroBalance: !r.hideIfZeroBalance }),
    feeCampaign: r => ({ ...r, feeCampaign: { effectiveBps: 5, baseBps: 10 } }),
    decimals: r => ({ ...r, decimals: r.decimals + 1 }),
    balance: r => ({ ...r, balance: r.balance.plus(1) }),
    balanceUsd: r => ({ ...r, balanceUsd: r.balanceUsd.plus(1) }),
    tokens: r => ({ ...r, tokens: [erc20({ symbol: 'OTHER' })] }),
  };

  it.each(Object.entries(mutations))('differs on %s', (_field, mutate) => {
    expect(depositFromVaultEntriesEqual([row()], [mutate(row())])).toBe(false);
  });
});

describe('selectedZapFeeEqual', () => {
  const option = (id: string): TransactOption => ({
    id,
    vaultId: 'vault-1',
    chainId: 'base',
    selectionId: 'selection-1',
    selectionOrder: SelectionOrder.Want,
    inputs: [erc20()],
    wantedOutputs: [erc20()],
    strategyId: 'vault',
    vaultType: 'standard',
    mode: TransactMode.Deposit,
  });
  const OPTION = option('option-1');
  const ctx = (value: number, fee: Partial<ZapFee> = {}): SelectedZapFee => ({
    option: OPTION,
    fee: { value, ...fee },
  });

  it('treats a value-equal rebuild as equal', () => {
    expect(selectedZapFeeEqual(ctx(0.0005), ctx(0.0005))).toBe(true);
  });

  it('separates a changed fee', () => {
    expect(selectedZapFeeEqual(ctx(0.0005), ctx(0.001))).toBe(false);
  });

  it('separates a different option even when the fee is identical', () => {
    const other: SelectedZapFee = { option: option('option-2'), fee: { value: 0.0005 } };
    expect(selectedZapFeeEqual(ctx(0.0005), other)).toBe(false);
  });

  it('compares the campaign attached to the fee', () => {
    const campaign = { original: 0.001, description: 'half off', id: 'promo' };
    expect(selectedZapFeeEqual(ctx(0.0005, { campaign }), ctx(0.0005, { campaign }))).toBe(true);
    expect(selectedZapFeeEqual(ctx(0.0005, { campaign }), ctx(0.0005))).toBe(false);
    expect(
      selectedZapFeeEqual(
        ctx(0.0005, { campaign }),
        ctx(0.0005, { campaign: { ...campaign, description: 'other' } })
      )
    ).toBe(false);
  });

  it('handles the undefined case both ways', () => {
    expect(selectedZapFeeEqual(undefined, undefined)).toBe(true);
    expect(selectedZapFeeEqual(ctx(0.0005), undefined)).toBe(false);
    expect(selectedZapFeeEqual(undefined, ctx(0.0005))).toBe(false);
  });
});
