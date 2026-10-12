import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { BeefyState } from '../../../../../data/store/types.ts';
import {
  buildFixture,
  FIXTURE_WALLET,
  FIXTURE_WALLET_KEY,
  renderTree,
} from '../../../../../data/selectors/subscription-stability.test-helper.tsx';
import { VaultTransactions } from './VaultTransactions.tsx';

let state: BeefyState;
let vaultId: string;

beforeAll(async () => {
  vi.stubGlobal('window', {
    location: {
      href: 'http://localhost/',
      origin: 'http://localhost',
      hostname: 'localhost',
      pathname: '/',
      search: '',
      hash: '',
    },
  });
  ({ state } = await buildFixture());
  const timelineVaultIds = Object.keys(
    state.user.analytics.byAddress[FIXTURE_WALLET_KEY]?.timeline.byVaultId ?? {}
  );
  expect(timelineVaultIds.length).toBeGreaterThan(0);
  vaultId = timelineVaultIds[0];
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

function withoutTimelines(state: BeefyState): BeefyState {
  const analytics = state.user.analytics.byAddress[FIXTURE_WALLET_KEY];
  return {
    ...state,
    user: {
      ...state.user,
      analytics: {
        ...state.user.analytics,
        byAddress: {
          ...state.user.analytics.byAddress,
          [FIXTURE_WALLET_KEY]: { ...analytics, timeline: { byVaultId: {} } },
        },
      },
    },
  };
}

describe('VaultTransactions', () => {
  it('renders the virtualised list when the vault has a timeline', () => {
    const { html } = renderTree(
      <VaultTransactions vaultId={vaultId} address={FIXTURE_WALLET} />,
      state
    );
    expect(html).toContain('data-virtuoso-scroller');
    expect(html).not.toContain('No transactions found');
  });

  it('renders an empty state instead of the list when the vault has no timeline', () => {
    const { html } = renderTree(
      <VaultTransactions vaultId={vaultId} address={FIXTURE_WALLET} />,
      withoutTimelines(state)
    );
    expect(html).toContain('No transactions found');
    expect(html).not.toContain('data-virtuoso-scroller');
  });
});
