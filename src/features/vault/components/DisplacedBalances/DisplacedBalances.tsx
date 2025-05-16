import { css } from '@repo/styles/css';
import { groupBy } from 'lodash-es';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { TokenAmountFromEntity } from '../../../../components/TokenAmount/TokenAmount.tsx';
import { TokenImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectVaultUserBalanceInDepositTokenBreakdown,
  type UserVaultBalanceBreakdownBridged,
  type UserVaultBalanceBreakdownEntry,
} from '../../../data/selectors/balance.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);
const typesToShow = ['bridged'] as const satisfies Array<UserVaultBalanceBreakdownEntry['type']>;

type EntryProps<T extends UserVaultBalanceBreakdownEntry = UserVaultBalanceBreakdownEntry> = {
  entry: T;
  depositToken: TokenEntity;
};

const BridgedEntry = memo(function BridgedEntry({
  entry,
  depositToken,
}: EntryProps<UserVaultBalanceBreakdownBridged>) {
  const classes = useStyles();
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, entry.chainId));

  return (
    <div className={classes.entry}>
      <TokenImage chainId={depositToken.chainId} address={depositToken.address} css={styles.icon} />
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

type TypesToShow = (typeof typesToShow)[number];

type EntriesToShow = Extract<UserVaultBalanceBreakdownEntry, { type: TypesToShow }>;
type TypeToArrayMap = {
  [T in TypesToShow]: Extract<EntriesToShow, { type: T }>[];
};

interface DisplacedBalancesProps {
  vaultId: VaultEntity['id'];
}

export const DisplacedBalances = memo(function DisplacedBalances({
  vaultId,
}: DisplacedBalancesProps) {
  const breakdown = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
  );
  const entriesToShow = useMemo(() => {
    return breakdown.entries.filter((entry): entry is EntriesToShow =>
      typesToShow.some(type => type === entry.type)
    );
  }, [breakdown.entries]);

  if (entriesToShow.length === 0) {
    return null;
  }

  return <DisplacedBalancesList entries={entriesToShow} depositToken={breakdown.depositToken} />;
});

interface DisplacedBalancesListProps {
  entries: EntriesToShow[];
  depositToken: TokenEntity;
}

const DisplacedBalancesList = memo(function DisplacedBalancesList({
  entries,
  depositToken,
}: DisplacedBalancesListProps) {
  const classes = useStyles();
  const byType = useMemo(() => groupBy(entries, 'type') as TypeToArrayMap, [entries]);

  return (
    <div className={classes.container}>
      {byType.bridged ?
        <BridgedEntries entries={byType.bridged} depositToken={depositToken} />
      : null}
    </div>
  );
});
