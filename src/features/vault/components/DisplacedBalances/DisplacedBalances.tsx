import { type FC, memo, useMemo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectVaultUserBalanceInDepositTokenBreakdown,
  type UserVaultBalanceBreakdownBoost,
  type UserVaultBalanceBreakdownBridged,
  type UserVaultBalanceBreakdownEntry,
} from '../../../data/selectors/balance';
import type { TokenEntity } from '../../../data/entities/token';
import { TokenImage } from '../../../../components/TokenImage/TokenImage';
import { Trans, useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../components/TokenAmount';
import { groupBy } from 'lodash-es';
import clsx from 'clsx';
import { selectBoostById } from '../../../data/selectors/boosts';
import { selectChainById } from '../../../data/selectors/chains';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

type EntryProps<T extends UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownEntry> = {
  entry: T;
  depositToken: TokenEntity;
};

const BoostEntry = memo<EntryProps<UserVaultBalanceBreakdownBoost>>(function BoostEntry({
  entry,
  depositToken,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, entry.boostId));

  return (
    <div className={classes.entry}>
      <TokenImage
        chainId={depositToken.chainId}
        tokenAddress={depositToken.address}
        className={classes.icon}
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

const BridgedEntry = memo<EntryProps<UserVaultBalanceBreakdownBridged>>(function BridgedEntry({
  entry,
  depositToken,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, entry.chainId));

  return (
    <div className={classes.entry}>
      <TokenImage
        chainId={depositToken.chainId}
        tokenAddress={depositToken.address}
        className={classes.icon}
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

const BoostEntries = memo<EntriesProps<UserVaultBalanceBreakdownBoost>>(function BoostEntries({
  entries,
  depositToken,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.entries)}>
      {entries.map(entry => (
        <BoostEntry key={entry.id} entry={entry} depositToken={depositToken} />
      ))}
    </div>
  );
});

const BridgedEntries = memo<EntriesProps<UserVaultBalanceBreakdownBridged>>(
  function BridgedEntries({ entries, depositToken }) {
    const classes = useStyles();

    return (
      <div className={clsx(classes.entries)}>
        {entries.map(entry => (
          <BridgedEntry key={entry.id} entry={entry} depositToken={depositToken} />
        ))}
      </div>
    );
  }
);

type TypeToComponentMap = Omit<
  {
    [T in UserVaultBalanceBreakdownEntry['type']]: FC<EntriesProps>;
  },
  'vault'
>;

const typeToComponent: TypeToComponentMap = {
  boost: BoostEntries,
  bridged: BridgedEntries,
};

const Entries = memo<EntriesProps>(function Entries({ entries, depositToken }) {
  const Component = typeToComponent[entries[0].type];
  return <Component entries={entries} depositToken={depositToken} />;
});

interface DisplacedBalancesProps {
  vaultId: VaultEntity['id'];
}

export const DisplacedBalances = memo<DisplacedBalancesProps>(function DisplacedBalances({
  vaultId,
}) {
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

export const DisplacedBalancesImpl = memo<DisplacedBalancesProps>(function DisplacedBalancesImpl({
  vaultId,
}) {
  const classes = useStyles();
  const breakdown = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
  );
  const entries = useMemo(() => groupBy(breakdown.entries, 'type'), [breakdown.entries]);

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
