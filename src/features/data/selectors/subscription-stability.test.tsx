import { memo, type ReactNode } from 'react';

import { useSelector } from 'react-redux';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BoostUnstakeSuccessContent } from '../../../components/Stepper/components/Content/Success/BoostUnstakeSuccessContent.tsx';
import { ZapSuccessContent } from '../../../components/Stepper/components/Content/Success/ZapSuccessContent.tsx';
import { VaultStats } from '../../../components/VaultStats/VaultStats.tsx';
import { VaultDashboardStats } from '../../../components/VaultStats/VaultDashboardStats.tsx';
import { ApyTooltipContent } from '../../../components/VaultStats/ApyTooltipContent.tsx';
import { TvlShareTooltip } from '../../../components/VaultStats/VaultTvlStat.tsx';
import { RewardsTooltipContent } from '../../../components/RewardsTooltip/RewardsTooltip.tsx';
import { VaultDepositedTooltip } from '../../../components/VaultDepositedTooltip/VaultDepositedTooltip.tsx';

import { Transaction } from '../../dashboard/components/UserVaults/components/VaultTransactions/components/Transaction/Transaction.tsx';
import { Vault as DashboardVaultRow } from '../../dashboard/components/UserVaults/components/Vault/Vault.tsx';
import { Vault as HomeVaultRow } from '../../home/components/Vault/Vault.tsx';
import { DesktopCollapseContent } from '../../dashboard/components/UserVaults/components/CollapseContent/DesktopCollapseContent/DesktopCollapseContent.tsx';
import { MobileCollapseContent } from '../../dashboard/components/UserVaults/components/CollapseContent/MobileCollapseContent/MobileCollapseContent.tsx';
import { ChainSelectStep } from '../../vault/components/Actions/Transact/ChainSelectStep/ChainSelectStep.tsx';
import { DepositFromVaultSelectList } from '../../vault/components/Actions/Transact/DepositFromVaultSelectList/DepositFromVaultSelectList.tsx';
import { FormStepFooter } from '../../vault/components/Actions/Transact/FormStepFooter/FormStepFooter.tsx';
import { DepositTokenSelectList } from '../../vault/components/Actions/Transact/TokenSelectList/DepositTokenSelectList.tsx';
import { WithdrawTokenSelectList } from '../../vault/components/Actions/Transact/TokenSelectList/WithdrawTokenSelectList.tsx';
import { MaybeZapFees } from '../../vault/components/Actions/Transact/VaultFees/ZapFees.tsx';

import type { TransactOption } from '../apis/transact/transact-types.ts';

import type { Step } from '../reducers/wallet/stepper-types.ts';

import { TransactMode, TransactStatus, TransactStep } from '../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../store/types.ts';
import { selectApyVaultUIData } from './apy.ts';
import { DashboardDataStatus, selectDashboardUserRewardsOrStatusByVaultId } from './dashboard.ts';
import { selectTvlBreakdownByVaultId } from './tvl.ts';
import { selectIsWalletConnected, selectWalletAddress } from './wallet.ts';
import { formatTotalApy } from '../../../helpers/format.ts';
import DepositFormLoader from '../../vault/components/Actions/Transact/DepositForm/DepositForm.tsx';
import WithdrawFormLoader from '../../vault/components/Actions/Transact/WithdrawForm/WithdrawForm.tsx';
import {
  buildFixture,
  describeUnstable,
  FIXTURE_CHAIN,
  FIXTURE_WALLET,
  FIXTURE_WALLET_KEY,
  renderTree,
  withBoostUnstakeSuccess,
  withZapSuccess,
  type BreakpointMatchesValue,
} from './subscription-stability-fixture.tsx';

/**
 * react-redux's `stabilityCheck` calls each subscribed selector a second time with the same state
 * and compares with that subscription's own comparator, so it fires only on a fresh reference the
 * comparator does not absorb. `renderToString` runs every `useSelector` in a tree exactly once and
 * skips effects, so nothing is fetched. Widening a comparator to `() => true`, or dropping a tree
 * from a test, silences the check without fixing anything.
 */

const FIXTURE_STEP: Step = {
  step: 'zap-in',
  message: 'fixture',
  action: () => undefined,
  pending: false,
};

function withTransactFormReady(
  state: BeefyState,
  mode: TransactMode.Deposit | TransactMode.Withdraw
): BeefyState {
  const vaultId = state.ui.transact.vaultId!;
  const { selections } = state.ui.transact;
  // `selectTransactOptionsForSelectionId` throws when a selection has no option
  const options = selections.allSelectionIds.map((selectionId, index) => {
    const selection = selections.bySelectionId[selectionId];
    const base = {
      id: `${selectionId}-option`,
      vaultId,
      chainId: FIXTURE_CHAIN,
      selectionId,
      selectionOrder: selection.order as TransactOption['selectionOrder'],
      inputs: selection.tokens,
      wantedOutputs: selection.tokens,
    };
    // `isZapOption` is `strategyId !== 'vault'`, so the first selection makes `MaybeZapFees` render
    return index === 0 ?
        ({ ...base, strategyId: 'single', feeable: true, mode } satisfies TransactOption)
      : ({ ...base, strategyId: 'vault', vaultType: 'standard', mode } satisfies TransactOption);
  });

  return {
    ...state,
    ui: {
      ...state.ui,
      transact: {
        ...state.ui.transact,
        mode,
        step: TransactStep.Form,
        selectedChainId: FIXTURE_CHAIN,
        selectedSelectionId: selections.allSelectionIds[0],
        options: {
          ...state.ui.transact.options,
          vaultId,
          mode,
          status: TransactStatus.Fulfilled,
          walletAddress: FIXTURE_WALLET,
          allOptionIds: options.map(option => option.id),
          byOptionId: Object.fromEntries(options.map(option => [option.id, option])),
          bySelectionId: Object.fromEntries(
            options.map(option => [option.selectionId, [option.id]])
          ),
        },
      },
    },
  };
}

function timelineVaultIdOf(state: BeefyState): string {
  const ids = Object.keys(
    state.user.analytics.byAddress[FIXTURE_WALLET_KEY]?.timeline.byVaultId ?? {}
  );
  if (ids.length === 0) {
    throw new Error('fixture has no timeline; the collapse tree would render an empty list');
  }
  return ids[0];
}

const MOBILE: BreakpointMatchesValue = { xs: true, sm: false, md: false, lg: false, xl: false };

const selectFreshRows = (state: BeefyState) =>
  state.entities.vaults.allVisibleIds.slice(0, 3).map(id => ({ id }));
const rowsEqual = (a: { id: string }[], b: { id: string }[]) =>
  a.length === b.length && a.every((row, i) => row.id === b[i].id);

const ControlUnguarded = memo(function ControlUnguarded() {
  const rows = useSelector(selectFreshRows);
  return <div>{`unguarded:${rows.length}`}</div>;
});

const ControlGuarded = memo(function ControlGuarded() {
  const rows = useSelector(selectFreshRows, rowsEqual);
  return <div>{`guarded:${rows.length}`}</div>;
});

const ControlStable = memo(function ControlStable() {
  const ids = useSelector((state: BeefyState) => state.entities.vaults.allVisibleIds);
  return <div>{`stable:${ids.length}`}</div>;
});

let fixture: Awaited<ReturnType<typeof buildFixture>>;

beforeAll(async () => {
  // `selectWalletAddress` reads `window.location.search` through a lazy factory; `matchMedia` is
  // left out so anything taking a browser path throws instead of rendering a different tree
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

describe('the detector itself', () => {
  it('the fixture is real: config-built entities, priced, with a funded wallet', () => {
    const { state, vaultIds } = fixture;
    expect(state.entities.chains.activeIds.length).toBeGreaterThan(5);
    expect(state.entities.vaults.allVisibleIds.length).toBeGreaterThan(100);
    expect(state.entities.platforms.allIds.length).toBeGreaterThan(10);
    expect(vaultIds.length).toBeGreaterThanOrEqual(3);
    expect(state.user.wallet.address).toBe(FIXTURE_WALLET);
    // the wallet slice is checksummed and the byAddress slices are not; if these drift apart the
    // connected-wallet subscriptions silently render their disconnected branch
    expect(selectIsWalletConnected(state)).toBe(true);
    expect(selectWalletAddress(state)).toBe(FIXTURE_WALLET);
    expect(state.user.balance.byAddress[FIXTURE_WALLET_KEY]?.depositedVaultIds).toEqual(vaultIds);
    for (const vaultId of vaultIds) {
      expect(state.biz.tvl.byVaultId[vaultId]).toBeDefined();
      expect(state.biz.apy.totalApy.byVaultId[vaultId]).toBeDefined();
    }
  });

  it('NEGATIVE CONTROL: an unguarded fresh-reference subscription is caught, and located', () => {
    const result = renderTree(<ControlUnguarded />, fixture.state);
    expect(describeUnstable(result)).toHaveLength(1);
    expect(result.unstable[0].selector).toBe('selectFreshRows');
    expect(result.unstable[0].at).toMatch(/ControlUnguarded.* at src\/.*subscription-stability/);
    expect(result.html).toContain('unguarded:3');
  });

  it('the same subscription with a comparator is silent', () => {
    const result = renderTree(<ControlGuarded />, fixture.state);
    expect(describeUnstable(result)).toEqual([]);
    expect(result.html).toContain('guarded:3');
  });

  it('a selector that returns a stored reference is silent', () => {
    const result = renderTree(<ControlStable />, fixture.state);
    expect(describeUnstable(result)).toEqual([]);
  });
});

describe('no subscription in a high-fanout tree is unstable', () => {
  it('the home vault row', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <HomeVaultRow key={id} vaultId={id} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(result.html).toContain('$123,456');
    expect(result.html).toContain('12.34%');
    expect(describeUnstable(result)).toEqual([]);
  });

  it('VaultStats on its own', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <VaultStats key={id} vaultId={id} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the dashboard vault row', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <DashboardVaultRow key={id} vaultId={id} address={FIXTURE_WALLET} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('VaultDashboardStats on its own', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <VaultDashboardStats key={id} vaultId={id} address={FIXTURE_WALLET} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(result.html).toMatch(/\$[\d,.]+/);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the mobile breakpoint of the dashboard row', () => {
    const result = renderTree(
      <>
        {fixture.vaultIds.map(id => (
          <DashboardVaultRow key={id} vaultId={id} address={FIXTURE_WALLET} />
        ))}
      </>,
      fixture.state,
      MOBILE
    );
    expect(result.subscriptions).toBeGreaterThan(fixture.vaultIds.length);
    expect(result.html).toMatch(/\$[\d,.]+/);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the transact select lists', () => {
    const result = renderTree(
      <>
        <ChainSelectStep />
        <DepositTokenSelectList />
        <WithdrawTokenSelectList />
        <DepositFromVaultSelectList />
        <MaybeZapFees />
        <FormStepFooter />
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(20);
    expect(describeUnstable(result)).toEqual([]);
  });

  /** `TooltipContent` returns null while closed, so no tree above runs the selectors inside */
  it('the tooltip bodies', () => {
    const { state, vaultIds } = fixture;
    const bodies = vaultIds.flatMap(vaultId => {
      const nodes: ReactNode[] = [
        <VaultDepositedTooltip
          key={`deposited-${vaultId}`}
          vaultId={vaultId}
          walletAddress={FIXTURE_WALLET}
        />,
      ];

      const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
      if ('underlyingTvl' in breakdown) {
        nodes.push(<TvlShareTooltip key={`tvl-${vaultId}`} breakdown={breakdown} />);
      }

      const apy = selectApyVaultUIData(state, vaultId);
      if (apy.status === 'available') {
        nodes.push(
          <ApyTooltipContent
            key={`apy-${vaultId}`}
            vaultId={vaultId}
            type="yearly"
            isBoosted={!!apy.boosted}
            rates={formatTotalApy(apy.values, '???')}
          />
        );
      }

      const rewards = selectDashboardUserRewardsOrStatusByVaultId(state, vaultId, FIXTURE_WALLET);
      if (rewards !== DashboardDataStatus.Loading && rewards !== DashboardDataStatus.Missing) {
        nodes.push(
          <RewardsTooltipContent
            key={`rewards-${vaultId}`}
            compounded={true}
            claimed={true}
            pending={true}
            rewards={rewards}
          />
        );
      }

      return nodes;
    });

    expect(bodies.length).toBeGreaterThan(vaultIds.length);
    const result = renderTree(<>{bodies}</>, state);
    expect(result.subscriptions).toBeGreaterThan(20);
    expect(result.html.length).toBeGreaterThan(2000);
    expect(describeUnstable(result)).toEqual([]);
  });

  /** the row mounts these only when `open`, which nothing flips in a server render */
  it('the dashboard collapse content, desktop', () => {
    const timelineVaultId = timelineVaultIdOf(fixture.state);
    const result = renderTree(
      <DesktopCollapseContent vaultId={timelineVaultId} address={FIXTURE_WALLET} />,
      fixture.state
    );
    // the tx list is a GroupedVirtuoso, whose itemContent never runs under renderToString, so the
    // rows are covered by the Transaction case below instead
    expect(result.subscriptions).toBeGreaterThan(8);
    expect(describeUnstable(result)).toEqual([]);
  });

  it('a dashboard transaction row, which virtuoso hides from the tree above', () => {
    const timelineVaultId = timelineVaultIdOf(fixture.state);
    const txs =
      fixture.state.user.analytics.byAddress[FIXTURE_WALLET_KEY]?.timeline.byVaultId[
        timelineVaultId
      ]?.current ?? [];
    expect(txs.length).toBeGreaterThan(0);
    const result = renderTree(
      <>
        {txs.map((tx, i) => (
          <Transaction key={i} tx={tx as never} />
        ))}
      </>,
      fixture.state
    );
    expect(result.subscriptions).toBeGreaterThan(0);
    expect(result.html).toContain('/tx/0x3333');
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the dashboard collapse content, mobile', () => {
    const timelineVaultId = timelineVaultIdOf(fixture.state);
    const result = renderTree(
      <MobileCollapseContent vaultId={timelineVaultId} address={FIXTURE_WALLET} />,
      fixture.state,
      MOBILE
    );
    expect(result.subscriptions).toBeGreaterThan(10);
    expect(describeUnstable(result)).toEqual([]);
  });

  /**
   * `renderToString` resolves `Suspense` to its fallback, so `FormStep`'s lazy targets are
   * imported directly, with the options its loader wrapper gates on already in the store.
   */
  it('the transact deposit form', () => {
    const result = renderTree(
      <DepositFormLoader />,
      withTransactFormReady(fixture.state, TransactMode.Deposit)
    );
    expect(result.subscriptions).toBeGreaterThan(50);
    expect(result.html).toContain('Select amount');
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the transact withdraw form', () => {
    const result = renderTree(
      <WithdrawFormLoader />,
      withTransactFormReady(fixture.state, TransactMode.Withdraw)
    );
    expect(result.subscriptions).toBeGreaterThan(50);
    expect(result.html).toContain('Select amount');
    expect(describeUnstable(result)).toEqual([]);
  });

  it('the stepper success screens', () => {
    // each screen reads the same walletActions slice but needs its own `additional.type`
    const zap = renderTree(
      <ZapSuccessContent step={FIXTURE_STEP} />,
      withZapSuccess(fixture.state, fixture.vaultIds[0], fixture.rewardToken)
    );
    expect(zap.subscriptions).toBeGreaterThan(5);
    expect(zap.html).toContain('successfully zapped');
    expect(describeUnstable(zap)).toEqual([]);

    const boost = renderTree(
      <BoostUnstakeSuccessContent step={FIXTURE_STEP} />,
      withBoostUnstakeSuccess(fixture.state, fixture.activeBoostId, fixture.rewardToken)
    );
    expect(boost.subscriptions).toBeGreaterThan(1);
    expect(boost.html).toContain(fixture.rewardToken.symbol);
    expect(describeUnstable(boost)).toEqual([]);
  });
});
