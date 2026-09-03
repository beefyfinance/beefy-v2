import { memo, Suspense } from 'react';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { GovVaultRewards } from '../../../components/GovVaultRewards/GovVaultRewards.tsx';
import { VaultTvl } from '../../../components/VaultTvl/VaultTvl.tsx';

import { ChainExposureLoader } from '../../dashboard/components/ChainExposure/ChainExposure.tsx';
import { PlatformExposureLoader } from '../../dashboard/components/PlatformExposure/PlatformExposure.tsx';
import { StablesExposure } from '../../dashboard/components/StablesExposure/StablesExposure.tsx';
import { TokenExposureLoader } from '../../dashboard/components/TokenExposure/TokenExposure.tsx';
import { DepositSummary } from '../../dashboard/components/DepositSummary.tsx';
import { useSortedDashboardVaults } from '../../dashboard/components/UserVaults/hook.ts';
import { PortfolioStats } from '../../home/components/HomeHeader/Stats/PortfolioStats.tsx';
import { PastBoosts } from '../../vault/components/Actions/Boosts/PastBoosts.tsx';
import { MerklRewards } from '../../vault/components/Actions/Transact/ClaimForm/Merkl/MerklRewards.tsx';
import { StellaSwapRewards } from '../../vault/components/Actions/Transact/ClaimForm/StellaSwap/StellaSwapRewards.tsx';
import { FormStepFooter } from '../../vault/components/Actions/Transact/FormStepFooter/FormStepFooter.tsx';
import { useCalculatedBreakdown } from '../../vault/components/LiquidityPoolBreakdown/hooks.ts';
import { ShareButton } from '../../vault/components/ShareButton/ShareButton.tsx';

import type { TokenLpBreakdown } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { selectPastBoostIdsWithUserBalance } from './balance.ts';
import { selectLpBreakdownForVaultId } from './tokens.ts';
import { selectVaultById } from './vaults.ts';

// a tree that renders its empty path passes vacuously, so every case asserts the fixture data
// reached the DOM

import { TransactMode, TransactStep } from '../reducers/wallet/transact-types.ts';
import {
  buildFixture,
  describeUnstable,
  FIXTURE_CHAIN,
  FIXTURE_WALLET,
  FIXTURE_WALLET_KEY,
  OTHER_WALLET,
  renderTree,
} from './subscription-stability-fixture.tsx';

const SortedDashboardVaultsProbe = memo(function SortedDashboardVaultsProbe({
  address,
}: {
  address: string;
}) {
  const { sortedFilteredVaults } = useSortedDashboardVaults(address);
  return <div>{`sorted:${sortedFilteredVaults.length}`}</div>;
});

/** the props are computed from state in the test body, so the probe adds no subscription */
const LpBreakdownProbe = memo(function LpBreakdownProbe({
  vault,
  breakdown,
}: {
  vault: VaultEntity;
  breakdown: TokenLpBreakdown;
}) {
  const data = useCalculatedBreakdown(vault, breakdown);
  return <div>{`assets:${data.assets.length}`}</div>;
});

let fixture: Awaited<ReturnType<typeof buildFixture>>;

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
  fixture = await buildFixture();
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('the trees the sibling file does not reach', () => {
  it('the fixture is deep enough for these trees', () => {
    const { state, vaultIds, activeBoostId, pastBoostId } = fixture;
    expect(vaultIds.length).toBeGreaterThanOrEqual(3);
    expect(state.entities.promos.allIds.length).toBeGreaterThan(10);
    expect(activeBoostId).toBeDefined();
    expect(pastBoostId).toBeDefined();
    expect(activeBoostId).not.toBe(pastBoostId);
    expect(state.entities.promos.statusById[activeBoostId]).toBe('active');
    expect(state.entities.promos.statusById[pastBoostId]).toBe('inactive');
    // without a boost position both trees render their empty path and pass vacuously
    expect(selectPastBoostIdsWithUserBalance(state, fixture.pastBoostVaultId)).toContain(
      pastBoostId
    );
    expect(
      state.user.rewards.byUser[FIXTURE_WALLET_KEY]?.byProvider.merkl.byVaultId[vaultIds[0]]
    ).toHaveLength(1);
  });

  it('the dashboard exposure cards', () => {
    const result = renderTree(
      <>
        <ChainExposureLoader address={FIXTURE_WALLET} title="chain" />
        <PlatformExposureLoader address={FIXTURE_WALLET} title="platform" />
        <TokenExposureLoader address={FIXTURE_WALLET} title="token" />
        <StablesExposure address={FIXTURE_WALLET} />
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThanOrEqual(8);
    // an empty exposure array still renders the chrome, so the sector count is the vacuity guard
    expect(result.html.match(/recharts-pie-sector/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(result.html).toContain('Stablecoin Exposure');
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the dashboard and home summary headers', () => {
    const result = renderTree(
      <>
        <DepositSummary address={FIXTURE_WALLET} />
        <PortfolioStats />
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(3);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the dashboard vault list hook', () => {
    const result = renderTree(
      <SortedDashboardVaultsProbe address={FIXTURE_WALLET} />,
      fixture.state
    );
    expect(result.html).toContain(`sorted:${fixture.vaultIds.length}`);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the vault page tvl and gov rewards stats', () => {
    const govVaultId = fixture.vaultIds.find(
      id => fixture.state.entities.vaults.byId[id]?.type === 'gov'
    );
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <VaultTvl key={id} vaultId={id} />
        ))}
        {govVaultId ?
          <GovVaultRewards vaultId={govVaultId} />
        : null}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(result.html).toContain('$123,456');
    expect(govVaultId).toBeDefined();
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the share button', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <ShareButton key={id} vaultId={id} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the past boosts list', () => {
    const result = renderTree(<PastBoosts vaultId={fixture.pastBoostVaultId} />, fixture.state);
    expect(result.subscriptions).toBeGreaterThan(1);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the claim form reward lists', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <MerklRewards
            key={`merkl-${id}`}
            vaultId={id}
            chainId={FIXTURE_CHAIN}
            walletAddress={FIXTURE_WALLET}
            deposited={true}
          />
        ))}
        {fixture.vaultIds.map(id => (
          <StellaSwapRewards
            key={`stella-${id}`}
            vaultId={id}
            chainId={FIXTURE_CHAIN}
            walletAddress={FIXTURE_WALLET}
            deposited={true}
          />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    // only the claimable path renders `OtherRewards`, which owns the per-chain subscription
    expect(result.html).toContain(fixture.rewardToken.symbol);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the liquidity pool breakdown', () => {
    const { state, vaultIds } = fixture;
    const probes = vaultIds.flatMap(vaultId => {
      const breakdown = selectLpBreakdownForVaultId(state, vaultId);
      if (!breakdown) {
        return [];
      }
      return [
        <LpBreakdownProbe
          key={vaultId}
          vault={selectVaultById(state, vaultId)}
          breakdown={breakdown}
        />,
      ];
    });
    expect(probes.length).toBeGreaterThan(0);
    const result = renderTree(<>{probes}</>, state);
    expect(result.html).toMatch(/assets:[1-9]/);
    expect(describeUnstable(result)).toEqual([]);
  });

  // the second comparator site is in `Zap`, which renders only after a `useEffect`
  it('the curve zap debugger', async () => {
    // imported here rather than at the top of the file: this component's module graph reaches
    // `store.ts`, which calls `addListeners()` at module scope and reads `window.location` there.
    // A static import would run that before `beforeAll` can stub `window`.
    const { CurveZap } =
      await import('../../vault/components/Actions/Transact/TransactDebugger/CurveZap.tsx');
    const vaultId = Object.keys(fixture.state.entities.vaults.byId).find(id => {
      const vault = fixture.state.entities.vaults.byId[id];
      return !!vault && 'zaps' in vault && vault.zaps.some(zap => zap.strategyId === 'curve');
    });
    expect(vaultId).toBeDefined();
    const result = renderTree(<CurveZap vaultId={vaultId!} />, fixture.state);
    expect(result.html).toContain('Loading curve zap debugger');
    expect(describeUnstable(result)).toEqual([]);
  });

  // the wallet holds a boost position, so `selectFooter` builds a fresh notice object per call
  it('the transact form footer, with a boost position', () => {
    // the notice bodies are `React.lazy`, so the tree needs a boundary
    const result = renderTree(
      <Suspense fallback={<div>{'notice-pending'}</div>}>
        <FormStepFooter />
      </Suspense>,
      {
        ...fixture.state,
        ui: {
          ...fixture.state.ui,
          transact: {
            ...fixture.state.ui.transact,
            vaultId: fixture.activeBoostVaultId ?? fixture.state.ui.transact.vaultId,
            mode: TransactMode.Withdraw,
            step: TransactStep.Form,
          },
        },
      }
    );
    expect(result.subscriptions).toBeGreaterThan(0);
    // the `undefined` notice renders nothing, so the fallback text is what proves the boost branch
    expect(result.html).toContain('notice-pending');
    expect(describeUnstable(result)).toEqual([]);
  });
  // the stability check repeats the same state, so a cache keyed on the wrong thing still passes
  it('does not carry one address answer over to the next', () => {
    // useId counts per render pass, so the generated ids differ between two identical renders
    const withoutIds = (html: string) =>
      html.replace(/(id|for|aria-labelledby|aria-describedby)="[^"]*"/g, '$1=""');

    // one at a time: a whole-tree diff still differs when only one member ignores its address
    const perAddress = [
      ['ChainExposure', (a: string) => <ChainExposureLoader address={a} title="chain" />],
      ['PlatformExposure', (a: string) => <PlatformExposureLoader address={a} title="platform" />],
      ['TokenExposure', (a: string) => <TokenExposureLoader address={a} title="token" />],
      ['StablesExposure', (a: string) => <StablesExposure address={a} />],
      ['DepositSummary', (a: string) => <DepositSummary address={a} />],
    ] as const;

    const differed: string[] = [];
    for (const [name, render] of perAddress) {
      const first = renderTree(render(FIXTURE_WALLET), fixture.state);
      const stranger = renderTree(render(OTHER_WALLET), fixture.state);
      const again = renderTree(render(FIXTURE_WALLET), fixture.state);

      expect(describeUnstable(first), name).toEqual([]);
      expect(describeUnstable(stranger), name).toEqual([]);
      expect(withoutIds(again.html), name).toBe(withoutIds(first.html));
      if (withoutIds(stranger.html) !== withoutIds(first.html)) {
        differed.push(name);
      }
    }

    // the by-chain chart coincides because both fixture addresses hold on the one chain
    expect(differed).toEqual([
      'PlatformExposure',
      'TokenExposure',
      'StablesExposure',
      'DepositSummary',
    ]);
  });
});
