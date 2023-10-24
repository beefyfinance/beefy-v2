import { type FC, memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../features/data/entities/vault';
import { useAppSelector } from '../../store';
import {
  selectStandardVaultUserBalanceInDepositTokenBreakdown,
  type StandardVaultBalanceBreakdownBoost,
  type StandardVaultBalanceBreakdownBridged,
  type StandardVaultBalanceBreakdownEntry,
  type StandardVaultBalanceBreakdownVault,
} from '../../features/data/selectors/balance';
import { selectStandardVaultById } from '../../features/data/selectors/vaults';
import {
  selectTokenByAddress,
  selectTokenPriceByTokenOracleId,
} from '../../features/data/selectors/tokens';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { TokenAmount } from '../TokenAmount';
import { formatBigUsd } from '../../helpers/format';
import { useTranslation } from 'react-i18next';
import { selectChainById } from '../../features/data/selectors/chains';
import { selectBoostById } from '../../features/data/selectors/boosts';

const useStyles = makeStyles(styles);

type EntryDisplayProps = {
  entry: StandardVaultBalanceBreakdownEntry;
  depositToken: TokenEntity;
  price: BigNumber;
  label: string;
};

const EntryDisplay = memo<EntryDisplayProps>(function VaultEntry({
  entry,
  depositToken,
  price,
  label,
}) {
  const classes = useStyles();
  const value = entry.amount.multipliedBy(price);
  return (
    <>
      <div className={classes.label}>{label}</div>
      <div className={classes.details}>
        <div className={classes.amount}>
          <TokenAmount amount={entry.amount} price={price} decimals={depositToken.decimals} />
        </div>
        <div className={classes.value}>{formatBigUsd(value)}</div>
      </div>
    </>
  );
});

const VaultEntry = memo<EntryProps<StandardVaultBalanceBreakdownVault>>(function VaultEntry({
  entry,
  depositToken,
  price,
}) {
  const { t } = useTranslation();
  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t('VaultStat-Deposited-Vault')}
    />
  );
});

const BoostEntry = memo<EntryProps<StandardVaultBalanceBreakdownBoost>>(function BoostEntry({
  entry,
  depositToken,
  price,
}) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, entry.boostId));
  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t('VaultStat-Deposited-Boost', { boost: boost.name })}
    />
  );
});

const BridgedEntry = memo<EntryProps<StandardVaultBalanceBreakdownBridged>>(function BridgedEntry({
  entry,
  depositToken,
  price,
}) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, entry.chainId));

  return (
    <EntryDisplay
      entry={entry}
      depositToken={depositToken}
      price={price}
      label={t('VaultStat-Deposited-Bridged', { chain: chain.name })}
    />
  );
});

type TypeToComponentMap = {
  [T in StandardVaultBalanceBreakdownEntry['type']]: FC<{
    entry: StandardVaultBalanceBreakdownEntry;
  }>;
};

const typeToComponent: TypeToComponentMap = {
  vault: VaultEntry,
  boost: BoostEntry,
  bridged: BridgedEntry,
};

type EntryProps<T extends StandardVaultBalanceBreakdownEntry = StandardVaultBalanceBreakdownEntry> =
  {
    entry: T;
    depositToken: TokenEntity;
    price: BigNumber;
  };

const Entry = memo<EntryProps>(function Entry(props) {
  const Component = typeToComponent[props.entry.type];
  return <Component {...props} />;
});

export type VaultDepositedTooltipProps = {
  vaultId: VaultEntity['id'];
};

export const VaultDepositedTooltip = memo<VaultDepositedTooltipProps>(
  function VaultDepositedTooltip({ vaultId }) {
    const classes = useStyles();
    const vault = useAppSelector(state => selectStandardVaultById(state, vaultId));
    const depositToken = useAppSelector(state =>
      selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
    );
    const price = useAppSelector(state =>
      selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
    );
    const breakdown = useAppSelector(state =>
      selectStandardVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
    );
    return (
      <div className={classes.grid}>
        {breakdown.map(entry => (
          <Entry key={entry.id} entry={entry} price={price} depositToken={depositToken} />
        ))}
      </div>
    );
  }
);
