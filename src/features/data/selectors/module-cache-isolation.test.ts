import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FilterContent, type FilterValues } from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import { FILTER_DEFAULTS } from '../utils/filter-values.ts';
import { selectSearchNoResultsInfo } from './no-results.ts';
import { selectWalletAddress } from './wallet.ts';

// the caches under test are module scope, so they persist across the tests in this file

// featureFlag_walletAddressOverride reads window.location.search behind a one-shot factory
beforeAll(() => {
  vi.stubGlobal('window', { location: { search: '', hostname: 'localhost' } });
});

const WALLET = '0x2AC513Bc6432063B391E5b12F04eAba71Aaf30dC';
const OTHER_WALLET = '0x451391ec8f8B4dEf10E5d8dd0e148A2D2Dd38160';

function makeFilters(overrides: Partial<FilterValues> = {}): FilterValues {
  return { ...FILTER_DEFAULTS, searchText: 'usdc', ...overrides };
}

type FixtureVault = {
  id: string;
  name: string;
  assets: string[];
  chainId: string;
  platformId: string;
};

const FIXTURE_VAULTS: FixtureVault[] = [
  {
    id: 'aero-usdc',
    name: 'USDC Vault',
    assets: ['USDC'],
    chainId: 'base',
    platformId: 'aerodrome',
  },
  {
    id: 'aave-usdc-weth',
    name: 'USDC-WETH',
    assets: ['USDC', 'WETH'],
    chainId: 'ethereum',
    platformId: 'aave',
  },
];

function makeState(filters: FilterValues, wallet?: { address: string; deposited: string[] }) {
  const chainIds = [...new Set([...FIXTURE_VAULTS.map(v => v.chainId), ...filters.chainIds])];
  const platformIds = [...new Set(FIXTURE_VAULTS.map(v => v.platformId))];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    entities: {
      vaults: {
        byId: Object.fromEntries(
          FIXTURE_VAULTS.map(v => [
            v.id,
            {
              id: v.id,
              type: 'standard',
              subType: 'standard',
              status: 'active',
              names: { list: v.name },
              assetIds: v.assets,
              chainId: v.chainId,
              platformId: v.platformId,
              assetType: 'lps',
              contractAddress: '0x111111111111111111111111111111111111000B',
              depositTokenAddress: '0x222222222222222222222222222222222222000D',
              receiptTokenAddress: '0x333333333333333333333333333333333333000B',
            },
          ])
        ),
        allVisibleIds: FIXTURE_VAULTS.map(v => v.id),
        contractData: { byVaultId: {} },
      },
      chains: {
        byId: Object.fromEntries(chainIds.map(id => [id, { id, name: capitalize(id) }])),
        allIds: chainIds,
        activeIds: chainIds,
        eolIds: [],
      },
      platforms: {
        byId: Object.fromEntries(platformIds.map(id => [id, { id, name: capitalize(id) }])),
        allIds: platformIds,
        activeIds: platformIds,
        usedIds: platformIds,
      },
      tokens: { byChainId: {} },
    },
    user: {
      wallet: { address: wallet?.address, connectedAddress: wallet?.address },
      balance: {
        byAddress:
          wallet ? { [wallet.address.toLowerCase()]: { depositedVaultIds: wallet.deposited } } : {},
      },
    },
    ui: {
      filteredVaults: {
        pending: filters,
        applied: filters,
        sortPickedDuringSearch: false,
        filteredVaultIds: [],
        sortedFilteredVaultIds: [],
        searchRanked: false,
        filterContent: FilterContent.Filter,
      },
    },
  } as unknown as BeefyState;
}

/** the state immer produces for a wallet change: a new root, every untouched slice by reference */
function withWallet(
  state: BeefyState,
  wallet: { address: string; deposited: string[] } | undefined
): BeefyState {
  return {
    ...state,
    user: {
      ...state.user,
      wallet: { ...state.user.wallet, address: wallet?.address, connectedAddress: wallet?.address },
      balance: {
        ...state.user.balance,
        byAddress:
          wallet ? { [wallet.address.toLowerCase()]: { depositedVaultIds: wallet.deposited } } : {},
      },
    },
  } as unknown as BeefyState;
}

describe('selectWalletAddress module cache', () => {
  it('is keyed on the raw address in the state argument, so it self-corrects in any order', () => {
    const a = makeState(makeFilters(), { address: WALLET, deposited: [] });
    const b = makeState(makeFilters(), { address: OTHER_WALLET, deposited: [] });
    const none = makeState(makeFilters());
    for (const order of [
      [a, b, none],
      [none, b, a],
      [b, a, b],
    ]) {
      expect(order.map(s => selectWalletAddress(s))).toEqual(
        order.map(s =>
          s === none ? undefined
          : s === a ? WALLET
          : OTHER_WALLET
        )
      );
    }
  });

  it('does not cache a throw from the override (regression for the stage-4 defect)', () => {
    const good = makeState(makeFilters(), { address: WALLET, deposited: [] });
    // viem's getAddress throws on a malformed address
    const bad = makeState(makeFilters(), { address: '0xnotanaddress', deposited: [] });

    expect(selectWalletAddress(good)).toBe(WALLET);
    expect(() => selectWalletAddress(bad)).toThrow();
    // the second read of the SAME bad address must throw again, not serve the previous wallet
    expect(() => selectWalletAddress(bad)).toThrow();
    expect(selectWalletAddress(good)).toBe(WALLET);
  });
});

describe('selectSearchNoResultsInfo module cache', () => {
  // chain=polygon hides both vaults and userCategory=deposited hides what the wallet is not in, so
  // clearing the chain reveals a vault only for a wallet that has a deposit
  const filters = makeFilters({
    searchText: 'usdc',
    chainIds: ['polygon'],
    userCategory: 'deposited',
  });
  const depositedState = makeState(filters, { address: WALLET, deposited: ['aero-usdc'] });
  const disconnectedState = withWallet(depositedState, undefined);

  const DEPOSITED_ANSWER = { kind: 'blocked', blockers: ['chain'], showCount: 1 };
  const DISCONNECTED_ANSWER = {
    kind: 'blocked',
    blockers: ['chain', 'userCategory'],
    showCount: 2,
  };

  /** a fresh `applied` identity forces a recompute, so each pair starts from a cold cache */
  const coldPair = (deposited: string[] | undefined) => {
    const wallet = deposited ? { address: WALLET, deposited } : undefined;
    const first = makeState({ ...filters }, wallet);
    return [
      first,
      withWallet(first, deposited ? undefined : { address: WALLET, deposited: ['aero-usdc'] }),
    ] as const;
  };

  it('the two wallets genuinely disagree, and share both cache gates by reference', () => {
    expect(depositedState.ui.filteredVaults.applied).toBe(
      disconnectedState.ui.filteredVaults.applied
    );
    expect(depositedState.entities.vaults.allVisibleIds).toBe(
      disconnectedState.entities.vaults.allVisibleIds
    );
    const [deposited] = coldPair(['aero-usdc']);
    const [disconnected] = coldPair(undefined);
    expect(selectSearchNoResultsInfo(deposited)).toEqual(DEPOSITED_ANSWER);
    expect(selectSearchNoResultsInfo(disconnected)).toEqual(DISCONNECTED_ANSWER);
  });

  it('does not serve the first wallet answer to the second', () => {
    expect(selectSearchNoResultsInfo(depositedState)).toEqual(DEPOSITED_ANSWER);
    expect(selectSearchNoResultsInfo(disconnectedState)).toEqual(DISCONNECTED_ANSWER);
  });

  it('gives the same answer for a state whichever wallet was read first', () => {
    const [a1, a2] = coldPair(['aero-usdc']);
    expect(selectSearchNoResultsInfo(a1)).toEqual(DEPOSITED_ANSWER);
    expect(selectSearchNoResultsInfo(a2)).toEqual(DISCONNECTED_ANSWER);

    const [b1, b2] = coldPair(undefined);
    expect(selectSearchNoResultsInfo(b1)).toEqual(DISCONNECTED_ANSWER);
    expect(selectSearchNoResultsInfo(b2)).toEqual(DEPOSITED_ANSWER);
  });

  it('returns the identical object across calls, which is what the cache is for', () => {
    const first = selectSearchNoResultsInfo(depositedState);
    const second = selectSearchNoResultsInfo(depositedState);
    expect(second).toBe(first);
  });
});
