import { type FC, memo, useMemo } from 'react';
import { styles } from './styles.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { useAppSelector } from '../../../../store.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectVaultUserBalanceInDepositTokenBreakdown,
  type UserVaultBalanceBreakdownBoost,
  type UserVaultBalanceBreakdownBridged,
  type UserVaultBalanceBreakdownEntry,
  type UserVaultBalanceBreakdownVault,
} from '../../../data/selectors/balance.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import { TokenImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../components/TokenAmount/TokenAmount.tsx';
import { groupBy } from 'lodash-es';
import { css } from '@repo/styles/css';
import { selectBoostById } from '../../../data/selectors/boosts.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { Link } from 'react-router';

const useStyles = legacyMakeStyles(styles);

type EntryProps<T extends UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownEntry> = {
  entry: T;
  depositToken: TokenEntity;
};

const BoostEntry = memo(function BoostEntry({
  entry,
  depositToken,
}: EntryProps<UserVaultBalanceBreakdownBoost>) {
  const classes = useStyles();
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, entry.boostId));

  return (
    <div className={classes.entry}>
      <TokenImage
        chainId={depositToken.chainId}
        tokenAddress={depositToken.address}
        css={styles.icon}
      />
      <div className={classes.text}>
        <Trans
          t={t}
          i18nKey="Transact-Displaced-boost"
          values={{
            symbol: depositToken.symbol,
            boost: boost.title,
          }}
          components={{
            amount: <TokenAmountFromEntity amount={entry.amount} token={depositToken} />,
            orange: <span className={classes.tokenAmount} />,
          }}
        />
      </div>
    </div>
  );
});

const BridgedEntry = memo(function BridgedEntry({
  entry,
  depositToken,
}: EntryProps<UserVaultBalanceBreakdownBridged>) {
  const classes = useStyles();
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, entry.chainId));

  return (
    <div className={classes.entry}>
      <TokenImage
        chainId={depositToken.chainId}
        tokenAddress={depositToken.address}
        css={styles.icon}
      />
      <div className={classes.text}>
        <Trans
          t={t}
          i18nKey="Transact-Displaced-bridged"
          values={{
            symbol: depositToken.symbol,
            chain: chain.name,
          }}
          components={{
            amount: <TokenAmountFromEntity amount={entry.amount} token={depositToken} />,
            orange: <span className={classes.tokenAmount} />,
            bridgeLink: <Link to={`/bridge`} className={classes.link} />,
          }}
        />
      </div>
    </div>
  );
});

type EntriesProps<T extends UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownEntry> = {
  entries: T[];
  depositToken: TokenEntity;
};

const BoostEntries = memo(function BoostEntries({
  entries,
  depositToken,
}: EntriesProps<UserVaultBalanceBreakdownBoost>) {
  return (
    <div className={css(styles.entries)}>
      {entries.map(entry => (
        <BoostEntry key={entry.id} entry={entry} depositToken={depositToken} />
      ))}
    </div>
  );
});

const BridgedEntries = memo(function BridgedEntries({
  entries,
  depositToken,
}: EntriesProps<UserVaultBalanceBreakdownBridged>) {
  return (
    <div className={css(styles.entries)}>
      {entries.map(entry => (
        <BridgedEntry key={entry.id} entry={entry} depositToken={depositToken} />
      ))}
    </div>
  );
});

type TypeToComponentMap = Omit<
  {
    [T in UserVaultBalanceBreakdownEntry['type']]: FC<
      EntriesProps<Extract<UserVaultBalanceBreakdownEntry, { type: T }>>
    >;
  },
  'vault'
>;

const typeToComponent: TypeToComponentMap = {
  boost: BoostEntries,
  bridged: BridgedEntries,
};

const Entries = memo(function Entries({
  entries,
  depositToken,
}: EntriesProps<Exclude<UserVaultBalanceBreakdownEntry, UserVaultBalanceBreakdownVault>>) {
  const Component = typeToComponent[entries[0].type] as FC<EntriesProps>;
  return <Component entries={entries} depositToken={depositToken} />;
});

interface DisplacedBalancesProps {
  vaultId: VaultEntity['id'];
}

export const DisplacedBalances = memo(function DisplacedBalances({
  vaultId,
}: DisplacedBalancesProps) {
  const total = useAppSelector(state =>
    selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(state, vaultId)
  );
  const vaultOnly = useAppSelector(state => selectUserVaultBalanceInDepositToken(state, vaultId));

  if (vaultOnly.gte(total)) {
    return null;
  }

  return <DisplacedBalancesImpl vaultId={vaultId} />;
});

interface DisplacedBalancesProps {
  vaultId: VaultEntity['id'];
}

type TypeToArrayMap = {
  [T in UserVaultBalanceBreakdownEntry as T['type']]: T[];
};

export const DisplacedBalancesImpl = memo(function DisplacedBalancesImpl({
  vaultId,
}: DisplacedBalancesProps) {
  const classes = useStyles();
  const breakdown = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
  );
  const entries = useMemo(
    () => groupBy(breakdown.entries, 'type') as TypeToArrayMap,
    [breakdown.entries]
  );

  return (
    <div className={classes.container}>
      {entries.boost ? (
        <Entries entries={entries.boost} depositToken={breakdown.depositToken} />
      ) : null}
      {entries.bridged ? (
        <Entries entries={entries.bridged} depositToken={breakdown.depositToken} />
      ) : null}
    </div>
  );
});
