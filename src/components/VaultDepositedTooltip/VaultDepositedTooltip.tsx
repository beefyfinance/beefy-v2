import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { type FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultEntity,
} from '../../features/data/entities/vault.ts';
import {
  selectUserRowDepositIncludingDisplaced,
  selectUserRowDepositInUsd,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
  selectVaultUserBalanceInDepositTokenBreakdown,
  type UserVaultBalanceBreakdownBoost,
  type UserVaultBalanceBreakdownBridged,
  type UserVaultBalanceBreakdownEntry,
  type UserVaultBalanceBreakdownPendingWithdrawal,
  type UserVaultBalanceBreakdownVault,
} from '../../features/data/selectors/balance.ts';
import { selectBoostById } from '../../features/data/selectors/boosts.ts';
import { selectChainById } from '../../features/data/selectors/chains.ts';
import {
  selectTokenByAddressOrUndefined,
  selectTokenPriceByTokenOracleId,
} from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { formatLargeUsd, formatTokenDisplay } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';

type EntryDisplayProps = {
  entry: UserVaultBalanceBreakdownEntry;
  depositToken: TokenEntity;
  price: BigNumber;
  label: string;
};

const EntryDisplay = memo(function VaultEntry({
  entry,
  depositToken,
  price,
  label,
}: EntryDisplayProps) {
  const value = entry.amount.multipliedBy(price);
  return (
    <>
      <Label>{label}</Label>
      <Details>
        <div>{formatTokenDisplay(entry.amount, depositToken.decimals)}</div>
        <Value>{formatLargeUsd(value)}</Value>
      </Details>
    </>
  );
});

const VaultEntry = memo(function VaultEntry({
  entry,
  depositToken,
  price,
  type,
  vaultLabel,
}: EntryProps<UserVaultBalanceBreakdownVault>) {
  const { t } = useTranslation();

  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={
        vaultLabel ??
        t([`VaultStat-Deposited-${entry.type}-${type}`, `VaultStat-Deposited-${entry.type}`])
      }
    />
  );
});

const PendingWithdrawalEntry = memo(function PendingWithdrawalEntry({
  entry,
  depositToken,
  price,
  type,
}: EntryProps<UserVaultBalanceBreakdownPendingWithdrawal>) {
  const { t } = useTranslation();

  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t([`VaultStat-Deposited-${entry.type}-${type}`, `VaultStat-Deposited-${entry.type}`])}
    />
  );
});

const BoostEntry = memo(function BoostEntry({
  entry,
  depositToken,
  price,
}: EntryProps<UserVaultBalanceBreakdownBoost>) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, entry.boostId));
  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t(`VaultStat-Deposited-${entry.type}`, { boost: boost.title })}
    />
  );
});

const BridgedEntry = memo(function BridgedEntry({
  entry,
  depositToken,
  price,
}: EntryProps<UserVaultBalanceBreakdownBridged>) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, entry.chainId));

  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t(`VaultStat-Deposited-${entry.type}`, { chain: chain.name })}
    />
  );
});

type TypeToComponentMap = {
  [T in UserVaultBalanceBreakdownEntry as T['type']]: FC<EntryProps<T>>;
};

const typeToComponent: TypeToComponentMap = {
  vault: VaultEntry,
  boost: BoostEntry,
  bridged: BridgedEntry,
  'pending-withdrawal': PendingWithdrawalEntry,
};

type EntryProps<T extends UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownEntry> = {
  entry: T;
  depositToken: TokenEntity;
  price: BigNumber;
  type: VaultEntity['type'];
  /** replaces the vault-type label, e.g. with a CLM side's name */
  vaultLabel?: string;
};

const Entry = memo(function Entry(props: EntryProps) {
  const Component = typeToComponent[props.entry.type] as FC<EntryProps>;
  return <Component {...props} />;
});

export type VaultDepositedTooltipProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
};

export const VaultDepositedTooltip = memo(function VaultDepositedTooltip({
  vaultId,
  walletAddress,
}: VaultDepositedTooltipProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (!isCowcentratedVault(vault)) {
    return (
      <Sides>
        <VaultBreakdown vaultId={vaultId} walletAddress={walletAddress} />
        <TotalRow vaultId={vaultId} walletAddress={walletAddress} />
      </Sides>
    );
  }

  // a merged CLM breaks down per side, named as on the withdraw tab
  return (
    <Sides>
      {vault.cowcentratedIds.vaults.map(id => (
        <SideBreakdown
          key={id}
          vaultId={id}
          walletAddress={walletAddress}
          labelKey="Transact-ClmMode-Vault"
        />
      ))}
      {vault.cowcentratedIds.pools.map(id => (
        <SideBreakdown
          key={id}
          vaultId={id}
          walletAddress={walletAddress}
          labelKey="Transact-ClmMode-Pool"
        />
      ))}
      <TotalRow vaultId={vaultId} walletAddress={walletAddress} />
    </Sides>
  );
});

/** the row the stat's own value used to carry: the whole position, at full precision */
const TotalRow = memo(function TotalRow({ vaultId, walletAddress }: VaultDepositedTooltipProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, vault.chainId, vault.depositTokenAddress)
  );
  const amount = useAppSelector(state =>
    selectUserRowDepositIncludingDisplaced(state, vaultId, walletAddress)
  );
  const usd = useAppSelector(state => selectUserRowDepositInUsd(state, vaultId, walletAddress));
  // every row the panel will draw, across the group's wrappers for a merged CLM
  const rows = useAppSelector(state =>
    (isCowcentratedVault(vault) ? getCowcentratedWrapperIds(vault) : [vaultId]).reduce(
      (count, id) =>
        count +
        selectVaultUserBalanceInDepositTokenBreakdown(state, id, walletAddress).entries.length,
      0
    )
  );
  // one row is the whole position already, so a total would just repeat it
  if (!depositToken || rows < 2) {
    return null;
  }
  return (
    <Grid>
      <TotalLabel>{t('VaultStat-Deposited-total')}</TotalLabel>
      <Details>
        <div>{formatTokenDisplay(amount, depositToken.decimals)}</div>
        <Value>{formatLargeUsd(usd)}</Value>
      </Details>
    </Grid>
  );
});

const SideBreakdown = memo(function SideBreakdown({
  vaultId,
  walletAddress,
  labelKey,
}: VaultDepositedTooltipProps & { labelKey: string }) {
  const { t } = useTranslation();
  const held = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenIncludingDisplaced(state, vaultId, walletAddress).gt(0)
  );
  return held ?
      <VaultBreakdown vaultId={vaultId} walletAddress={walletAddress} vaultLabel={t(labelKey)} />
    : null;
});

const VaultBreakdown = memo(function VaultBreakdown({
  vaultId,
  walletAddress,
  vaultLabel,
}: VaultDepositedTooltipProps & { vaultLabel?: string }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { depositToken, entries } = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId, walletAddress)
  );
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );
  const notEarning = useAppSelector(state =>
    selectUserVaultBalanceNotInActiveBoostInDepositToken(state, vaultId, walletAddress)
  );

  return (
    <Grid>
      {entries.map(entry => (
        <Entry
          key={entry.id}
          entry={entry}
          price={price}
          depositToken={depositToken}
          type={vault.type}
          vaultLabel={vaultLabel}
        />
      ))}
      {notEarning.gt(0) && <NotInBoost>{t('VaultStat-Deposited-NotInActiveBoost')}</NotInBoost>}
    </Grid>
  );
});

const Sides = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

const Grid = styled('div', {
  base: {
    textStyle: 'body',
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
});

const TotalLabel = styled('div', {
  base: {
    color: 'colorPalette.text.title',
    fontWeight: 'medium',
  },
});

const Label = styled('div', {
  base: {
    color: 'colorPalette.text.title',
  },
});

const Details = styled('div', {
  base: {
    color: 'colorPalette.text.title',
    textAlign: 'right',
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'colorPalette.text.label',
  },
});

const NotInBoost = styled('div', {
  base: {
    gridColumn: '1 / span 2',
    fontWeight: 'medium',
  },
});
