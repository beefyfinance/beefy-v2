import { configureStore } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { getAddress, type Address } from 'viem';
import { BreakpointContext } from '../../../hooks/useBreakpoints.ts';
import { i18n } from '../../../i18n.ts';
import { recalculateTotalApyAction } from '../actions/apy.ts';
import { fetchChainConfigs } from '../actions/chains.ts';
import { fetchPlatforms } from '../actions/platforms.ts';
import { fetchAllPricesAction } from '../actions/prices.ts';
import { initPromos } from '../actions/promos.ts';
import { fetchAddressBookAction } from '../actions/tokens.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import type { BeefyAPILpBreakdownResponse } from '../apis/beefy/beefy-api-types.ts';
import type { TotalApy } from '../reducers/apy-types.ts';
import type { LoaderStateFulfilled } from '../reducers/data-loader-types.ts';
import { rootReducer } from '../reducers/reducers.ts';
import { setTvlContractState } from '../reducers/tvl.ts';
import type { BalanceState } from '../reducers/wallet/balance-types.ts';
import type { TimelineEntityStandard, TimelineEntryStandard } from '../entities/analytics.ts';
import type { TransactSelection, TransactSelections } from '../reducers/wallet/transact-types.ts';
import type {
  MerklVaultReward,
  StellaSwapVaultReward,
  UserRewardsState,
} from '../reducers/wallet/user-rewards-types.ts';
import type { BeefyState } from '../store/types.ts';
import type { TokenEntity } from '../entities/token.ts';

export const UNSTABLE_MESSAGE = 'returned a different result when called with the same parameters';
export const FIXTURE_TIMESTAMP = 1_700_000_000_000;
export const FIXTURE_CHAIN = 'base' as const;
// the wallet slice holds the checksummed address; every byAddress/byUser slice is keyed lowercase
export const FIXTURE_WALLET = getAddress('0x1234567890abcdef1234567890abcdef12345678');
export const FIXTURE_WALLET_KEY = FIXTURE_WALLET.toLowerCase();
export const OTHER_WALLET = getAddress('0xdEaD000000000000000000000000000000000002');
export const OTHER_WALLET_KEY = OTHER_WALLET.toLowerCase();

export const FULFILLED: LoaderStateFulfilled = {
  status: 'fulfilled',
  error: null,
  lastDispatched: { timestamp: FIXTURE_TIMESTAMP, requestId: 'fixture' },
  lastFulfilled: { timestamp: FIXTURE_TIMESTAMP, requestId: 'fixture' },
  lastRejected: undefined,
};

function makeTransactSelections(state: BeefyState): TransactSelections {
  const tokens = Object.values(state.entities.tokens.byChainId[FIXTURE_CHAIN]?.byAddress ?? {})
    .filter((token): token is TokenEntity => token !== undefined)
    .slice(0, 4);
  const selections: TransactSelection[] = tokens.map((token, order) => ({
    id: `fixture-selection-${order}`,
    tokens: [token],
    order,
    hideIfZeroBalance: false,
  }));

  return {
    allSelectionIds: selections.map(selection => selection.id),
    bySelectionId: Object.fromEntries(selections.map(selection => [selection.id, selection])),
    allChainIds: [FIXTURE_CHAIN],
    byChainId: { [FIXTURE_CHAIN]: selections.map(selection => selection.id) },
  };
}

function makeTimelines(
  state: BeefyState,
  vaultIds: string[]
): Record<string, TimelineEntityStandard> {
  const vaultId = vaultIds.find(id => state.entities.vaults.byId[id]?.type === 'standard');
  const vault = vaultId ? state.entities.vaults.byId[vaultId] : undefined;
  if (!vaultId || !vault || !('receiptTokenAddress' in vault)) {
    return {};
  }

  const current = [0, 1, 2, 3].map(
    (index): TimelineEntryStandard => ({
      type: 'standard',
      vaultId,
      timeline: 'current',
      transactionId: `fixture-tx-${index}`,
      transactionHash: `0x${index.toString().repeat(64).slice(0, 64)}`,
      datetime: new Date(FIXTURE_TIMESTAMP + index * 86_400_000),
      productKey: `beefy:vault:${FIXTURE_CHAIN}:${vault.receiptTokenAddress}`,
      displayName: vaultId,
      chain: FIXTURE_CHAIN,
      isEol: false,
      isDashboardEol: false,
      shareBalance: new BigNumber(25 * (index + 1)),
      shareDiff: new BigNumber(25),
      shareToUnderlyingPrice: new BigNumber(1.05),
      underlyingBalance: new BigNumber(26.25 * (index + 1)),
      underlyingDiff: new BigNumber(26.25),
      underlyingToUsdPrice: new BigNumber(1.5),
      usdBalance: new BigNumber(39.375 * (index + 1)),
      usdDiff: new BigNumber(39.375),
    })
  );

  return { [vaultId]: { type: 'standard', current, past: [], buckets: [] } };
}

export async function buildFixture() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefault => getDefault({ serializableCheck: false, immutableCheck: false }),
  });

  await store.dispatch(fetchChainConfigs());
  await store.dispatch(fetchAllVaults());
  await store.dispatch(fetchPlatforms());
  // every chain, not just the fixture chain: `selectWrappedToNativeSymbolMap` walks them all and
  // throws on the first missing addressbook
  await Promise.all(
    store
      .getState()
      .entities.chains.allIds.map(chainId => store.dispatch(fetchAddressBookAction({ chainId })))
  );
  // `PastBoosts` and the footer notice key off a real boost entity, not just a fulfilled loader
  await store.dispatch(initPromos());

  const configured = store.getState();
  const onChain = configured.entities.vaults.byChainId[FIXTURE_CHAIN]?.allIds ?? [];
  const byType = (type: string, subType?: string) =>
    onChain.find(id => {
      const vault = configured.entities.vaults.byId[id];
      return (
        !!vault &&
        vault.status === 'active' &&
        vault.type === type &&
        (subType === undefined || ('subType' in vault && vault.subType === subType))
      );
    });

  const vaultIds = [
    byType('standard', 'standard'),
    byType('standard', 'cowcentrated'),
    byType('gov'),
    byType('cowcentrated'),
    byType('erc4626'),
  ].filter((id): id is string => id !== undefined);

  // statuses are forced, or this goes vacuous the day every boost in `config/promos` expires
  const boostIds = configured.entities.promos.byType.boost?.byChainId[FIXTURE_CHAIN]?.allIds ?? [];
  const boostsByVault = new Map<string, string[]>();
  for (const boostId of boostIds) {
    const promo = configured.entities.promos.byId[boostId];
    if (!promo) continue;
    const list = boostsByVault.get(promo.vaultId) ?? [];
    list.push(boostId);
    boostsByVault.set(promo.vaultId, list);
  }
  const boostedVaults = [...boostsByVault.entries()].filter(
    ([vaultId]) => configured.entities.vaults.byId[vaultId] !== undefined
  );
  // `selectPastVaultBoostIds` filters on `'inactive'`; `'expired'` is not a `PromoEntity['status']`
  const activeBoost = boostedVaults[0];
  const pastBoost = boostedVaults[1];

  const prices: Record<string, number> = {};
  for (const vaultId of vaultIds) {
    const vault = configured.entities.vaults.byId[vaultId]!;
    for (const assetId of vault.assetIds) {
      prices[assetId] = 1.5;
    }
    prices[vaultId] = 2.5;
  }
  for (const chain of Object.values(configured.entities.chains.byId)) {
    prices[chain.native.oracleId] = 3000;
  }
  const breakdowns: BeefyAPILpBreakdownResponse = {};
  for (const vaultId of vaultIds) {
    const vault = configured.entities.vaults.byId[vaultId]!;
    const addresses =
      'depositTokenAddresses' in vault ? vault.depositTokenAddresses
      : 'depositTokenAddress' in vault ? [vault.depositTokenAddress]
      : [];
    breakdowns[vault.breakdownId] = {
      price: 2.5,
      tokens: addresses,
      balances: addresses.map(() => '1000'),
      totalSupply: '1000',
      underlyingPrice: 2.5,
      underlyingBalances: addresses.map(() => '1000'),
      underlyingLiquidity: '2500',
    };
  }
  // wrapped native: a real address-book erc20, so the claim forms resolve it to a priced entity
  const chainTokens = configured.entities.tokens.byChainId[FIXTURE_CHAIN];
  if (!chainTokens?.wnative) {
    throw new Error(`fixture chain ${FIXTURE_CHAIN} has no wrapped native token`);
  }
  const rewardToken = chainTokens.byAddress[chainTokens.byId[chainTokens.wnative]];
  if (!rewardToken || rewardToken.type !== 'erc20') {
    throw new Error(`fixture chain ${FIXTURE_CHAIN} wrapped native is not an erc20`);
  }
  prices[rewardToken.oracleId] = 4;

  store.dispatch(fetchAllPricesAction.fulfilled({ prices, breakdowns }, 'fixture', undefined));

  const totals: Record<string, TotalApy> = {};
  for (const vaultId of vaultIds) {
    totals[vaultId] = {
      totalApy: 0.1234,
      totalType: 'apy',
      totalMonthly: 0.0098,
      totalDaily: 0.00032,
      vaultApr: 0.11,
      vaultDaily: 0.0003,
      tradingApr: 0.02,
      tradingDaily: 0.00005,
    };
  }
  store.dispatch(recalculateTotalApyAction.fulfilled({ totals }, 'fixture', undefined));

  store.dispatch(
    setTvlContractState({
      totalTvl: new BigNumber(9_000_000),
      byVaultId: Object.fromEntries(
        vaultIds.map(vaultId => [
          vaultId,
          { tvl: new BigNumber(123456.78), rawTvl: new BigNumber(54321) },
        ])
      ),
      byBoostId: {},
      byChaindId: { [FIXTURE_CHAIN]: new BigNumber(9_000_000) },
    })
  );

  const built = store.getState();
  const state: BeefyState = {
    ...built,
    entities: {
      ...built.entities,
      promos: {
        ...built.entities.promos,
        statusById: {
          ...built.entities.promos.statusById,
          ...(activeBoost ? { [activeBoost[1][0]]: 'active' as const } : {}),
          ...(pastBoost ? { [pastBoost[1][0]]: 'inactive' as const } : {}),
        },
      },
    },
    user: {
      ...built.user,
      wallet: {
        ...built.user.wallet,
        address: FIXTURE_WALLET,
        connectedAddress: FIXTURE_WALLET,
      },
      balance: makeBalances(
        built,
        vaultIds,
        [activeBoost, pastBoost].filter((entry): entry is [string, string[]] => !!entry),
        rewardToken
      ),
      rewards: makeUserRewards(rewardToken, vaultIds),
      analytics: {
        ...built.user.analytics,
        byAddress: {
          ...built.user.analytics.byAddress,
          [FIXTURE_WALLET_KEY]: {
            timeline: { byVaultId: makeTimelines(built, vaultIds) },
            clmHarvests: { byVaultId: {} },
            clmVaultHarvests: { byVaultId: {} },
          },
        },
      },
    },
    ui: {
      ...built.ui,
      transact: {
        ...built.ui.transact,
        vaultId: vaultIds[0],
        // without these every select-list selector takes its `EMPTY_ARRAY` path and renders no rows
        selections: makeTransactSelections(built),
      },
      dataLoader: {
        ...built.ui.dataLoader,
        global: {
          ...built.ui.dataLoader.global,
          apy: FULFILLED,
          avgApy: FULFILLED,
          chainConfig: FULFILLED,
          platforms: FULFILLED,
          prices: FULFILLED,
          vaults: FULFILLED,
          addressBook: FULFILLED,
          promos: FULFILLED,
          curators: FULFILLED,
        },
        byChainId: {
          ...built.ui.dataLoader.byChainId,
          [FIXTURE_CHAIN]: { contractData: FULFILLED, addressBook: FULFILLED },
        },
        byAddress: Object.fromEntries(
          [FIXTURE_WALLET_KEY, OTHER_WALLET_KEY].map(address => [
            address,
            {
              global: {
                timeline: FULFILLED,
                depositedVaults: FULFILLED,
                dashboard: FULFILLED,
                clmHarvests: FULFILLED,
                merklRewards: FULFILLED,
                stellaSwapRewards: FULFILLED,
              },
              byChainId: {
                [FIXTURE_CHAIN]: {
                  balance: FULFILLED,
                  allowance: FULFILLED,
                  clmHarvests: FULFILLED,
                },
              },
            },
          ])
        ),
      },
    },
  };

  return {
    state,
    vaultIds,
    rewardToken,
    activeBoostVaultId: activeBoost?.[0],
    activeBoostId: activeBoost?.[1][0],
    pastBoostVaultId: pastBoost?.[0],
    pastBoostId: pastBoost?.[1][0],
  };
}

function makeUserRewards(rewardToken: TokenEntity, vaultIds: string[]): UserRewardsState {
  const token = {
    decimals: rewardToken.decimals,
    symbol: rewardToken.symbol,
    address: rewardToken.address as Address,
    chainId: rewardToken.chainId,
  };
  const merklVaultReward: MerklVaultReward = {
    campaignIds: ['fixture-campaign'],
    token,
    accumulated: new BigNumber(10),
    unclaimed: new BigNumber(4),
  };
  const stellaSwapVaultReward: StellaSwapVaultReward = {
    position: 0,
    token,
    proofs: [],
    isNative: false,
    accumulated: new BigNumber(10),
    unclaimed: new BigNumber(4),
    claimContractAddress: rewardToken.address,
  };

  return {
    byUser: {
      [FIXTURE_WALLET_KEY]: {
        byProvider: {
          merkl: {
            byVaultId: Object.fromEntries(vaultIds.map(id => [id, [merklVaultReward]])),
            byChainId: {
              [FIXTURE_CHAIN]: [
                { token, accumulated: new BigNumber(20), unclaimed: new BigNumber(9), proof: [] },
              ],
            },
          },
          stellaswap: {
            byVaultId: Object.fromEntries(vaultIds.map(id => [id, [stellaSwapVaultReward]])),
          },
        },
      },
    },
  };
}

function makeBalances(
  state: BeefyState,
  vaultIds: string[],
  boosts: Array<[string, string[]]>,
  rewardToken: TokenEntity
): BalanceState {
  const byTokenAddress: Record<string, { balance: BigNumber }> = {};
  const byGovVaultId: BalanceState['byAddress'][string]['tokenAmount']['byGovVaultId'] = {};
  const byVaultId: BalanceState['byAddress'][string]['tokenAmount']['byVaultId'] = {};
  const byBoostId: BalanceState['byAddress'][string]['tokenAmount']['byBoostId'] = {};

  for (const vaultId of vaultIds) {
    const vault = state.entities.vaults.byId[vaultId]!;
    if (vault.type === 'gov') {
      byGovVaultId[vaultId] = {
        balance: new BigNumber(100),
        // a pending gov reward, so `GovVaultRewards` renders its `rewards` branch not its empty one
        rewards: [{ token: rewardToken, amount: new BigNumber(7), index: 0 }],
      };
    } else if ('receiptTokenAddress' in vault) {
      byTokenAddress[vault.receiptTokenAddress.toLowerCase()] = { balance: new BigNumber(100) };
    }
    byVaultId[vaultId] = { pendingWithdrawals: { shares: new BigNumber(0), requests: [] } };
  }

  for (const [, ids] of boosts) {
    for (const boostId of ids) {
      byBoostId[boostId] = {
        balance: new BigNumber(50),
        rewards: [{ token: rewardToken, amount: new BigNumber(3), index: 0 }],
      };
    }
  }

  // non-empty but different from the first address, so a wrongly-keyed answer is detectable
  const otherVaultIds = vaultIds.slice(0, 1);
  const otherByTokenAddress: Record<string, { balance: BigNumber }> = {};
  const otherByGovVaultId: BalanceState['byAddress'][string]['tokenAmount']['byGovVaultId'] = {};
  const otherByVaultId: BalanceState['byAddress'][string]['tokenAmount']['byVaultId'] = {};
  for (const vaultId of otherVaultIds) {
    const vault = state.entities.vaults.byId[vaultId]!;
    if (vault.type === 'gov') {
      otherByGovVaultId[vaultId] = {
        balance: new BigNumber(9),
        rewards: [{ token: rewardToken, amount: new BigNumber(1), index: 0 }],
      };
    } else if ('receiptTokenAddress' in vault) {
      otherByTokenAddress[vault.receiptTokenAddress.toLowerCase()] = { balance: new BigNumber(9) };
    }
    otherByVaultId[vaultId] = { pendingWithdrawals: { shares: new BigNumber(0), requests: [] } };
  }

  return {
    byAddress: {
      [FIXTURE_WALLET_KEY]: {
        depositedVaultIds: [...vaultIds],
        tokenAmount: {
          byChainId: { [FIXTURE_CHAIN]: { byTokenAddress } },
          byBoostId,
          byGovVaultId,
          byVaultId,
        },
      },
      [OTHER_WALLET_KEY]: {
        depositedVaultIds: [...otherVaultIds],
        tokenAmount: {
          byChainId: { [FIXTURE_CHAIN]: { byTokenAddress: otherByTokenAddress } },
          byBoostId: {},
          byGovVaultId: otherByGovVaultId,
          byVaultId: otherByVaultId,
        },
      },
    },
  };
}

export type UnstableSubscription = { selector: string; at: string };
export type RenderResult = {
  html: string;
  unstable: UnstableSubscription[];
  subscriptions: number;
};

export function subscriberFromStack(stack: string): string {
  for (const line of stack.split('\n').slice(1)) {
    if (line.includes('node_modules') || line.includes('node:')) {
      continue;
    }
    const named = /^\s*at (?:async )?([^\s(]+) \((.+?):(\d+):\d+\)$/.exec(line);
    if (named) {
      if (named[1] === 'captureStabilityWarning') {
        continue;
      }
      return `${named[1]} at ${relativeToRepo(named[2])}:${named[3]}`;
    }
    const anonymous = /^\s*at (?:async )?(\/.+?):(\d+):\d+$/.exec(line);
    if (anonymous) {
      return `${relativeToRepo(anonymous[1])}:${anonymous[2]}`;
    }
  }
  return 'unknown subscriber';
}

function relativeToRepo(file: string): string {
  return file.replace(`${process.cwd()}/`, '').replace(/^file:\/\//, '');
}

export type BreakpointMatchesValue = React.ContextType<typeof BreakpointContext>;
export const DESKTOP: BreakpointMatchesValue = {
  xs: true,
  sm: true,
  md: true,
  lg: true,
  xl: false,
};

export function renderTree(
  tree: ReactNode,
  state: BeefyState,
  breakpoint?: BreakpointMatchesValue
) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: state as unknown as Record<string, never>,
    middleware: getDefault => getDefault({ serializableCheck: false, immutableCheck: false }),
  });

  let subscriptions = 0;
  const getState = store.getState.bind(store);
  store.getState = () => {
    subscriptions += 1;
    return getState();
  };

  const unstable: UnstableSubscription[] = [];
  const realWarn = console.warn;
  const realError = console.error;
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.includes('useLayoutEffect does nothing on the server')) {
      return;
    }
    realError(...args);
  };
  function captureStabilityWarning(...args: unknown[]) {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (message.includes(UNSTABLE_MESSAGE)) {
      unstable.push({
        selector: /^Selector (\S+) returned/.exec(message)?.[1] ?? 'anonymous',
        at: subscriberFromStack(new Error('stability').stack ?? ''),
      });
      return;
    }
    if (message.includes('useLayoutEffect does nothing on the server')) {
      return;
    }
    realWarn(...args);
  }

  console.warn = captureStabilityWarning;
  try {
    const html = renderToString(
      <Provider store={store} stabilityCheck="always">
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <BreakpointContext.Provider value={breakpoint ?? DESKTOP}>
              {tree}
            </BreakpointContext.Provider>
          </MemoryRouter>
        </I18nextProvider>
      </Provider>
    );
    return { html, unstable, subscriptions } satisfies RenderResult;
  } finally {
    console.warn = realWarn;
    console.error = realError;
  }
}

export function describeUnstable(result: RenderResult): string[] {
  return result.unstable.map(entry => `${entry.selector} -- subscribed by ${entry.at}`);
}

const SUCCESS_RECEIPT = {
  from: FIXTURE_WALLET,
  to: FIXTURE_WALLET,
  contractAddress: FIXTURE_WALLET,
  status: 'success',
  logs: [],
};

/** without a boost `additional` the success screen renders "UNKNOWN" and a zero amount */
export function withBoostUnstakeSuccess(
  state: BeefyState,
  boostId: string,
  token: TokenEntity
): BeefyState {
  return {
    ...state,
    user: {
      ...state.user,
      walletActions: {
        result: 'success',
        data: { hash: '0xfixture', receipt: SUCCESS_RECEIPT },
        additional: {
          type: 'boost',
          boostId,
          amount: new BigNumber(3),
          token,
          walletAddress: FIXTURE_WALLET,
        },
      },
    },
  } as unknown as BeefyState;
}

/** without a zap `additional` every returned-token selector takes its shared-empty exit */
export function withZapSuccess(state: BeefyState, vaultId: string, token: TokenEntity): BeefyState {
  return {
    ...state,
    user: {
      ...state.user,
      walletActions: {
        result: 'success',
        data: { hash: '0xfixture', receipt: SUCCESS_RECEIPT },
        additional: {
          type: 'zap',
          vaultId,
          expectedTokens: [token],
          amount: new BigNumber(5),
          token,
        },
      },
    },
  } as unknown as BeefyState;
}
