import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
} from '../../features/data/selectors/balance';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import { selectIsBalanceHidden, selectWalletAddress } from '../../features/data/selectors/wallet';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader';
import { BIG_ZERO } from '../../helpers/big-number';
import { useAppSelector } from '../../store';
import { type BigNumber } from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ErrorOutline, InfoOutlined } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
  label?: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

type SelectDataReturn =
  | { loading: true }
  | {
      loading: false;
      totalDeposit: BigNumber;
    }
  | {
      loading: false;
      totalDeposit: BigNumber;
      hideBalance: boolean;
      depositToken: TokenEntity;
      totalDepositUsd: BigNumber;
      vaultDeposit: BigNumber;
      notEarning: BigNumber;
    };

// TEMP: selector instead of connect/mapStateToProps
function selectData(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  maybeWalletAddress?: string
): SelectDataReturn {
  const vault = selectVaultById(state, vaultId);
  const walletAddress = maybeWalletAddress || selectWalletAddress(state);
  if (!walletAddress) {
    return { loading: false, totalDeposit: BIG_ZERO };
  }

  const isLoaded =
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  if (!isLoaded) {
    return { loading: true };
  }

  const totalDeposit = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vault.id,
    walletAddress
  );
  if (!totalDeposit.gt(0)) {
    return { loading: false, totalDeposit: BIG_ZERO };
  }

  const hideBalance = selectIsBalanceHidden(state);
  const notEarning = selectUserVaultBalanceNotInActiveBoostInDepositToken(
    state,
    vault.id,
    walletAddress
  );
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalDepositUsd = selectUserVaultBalanceInUsdIncludingBoostsBridged(
    state,
    vaultId,
    walletAddress
  );
  const vaultDeposit = selectUserVaultBalanceInDepositToken(state, vault.id, walletAddress);

  return {
    loading: false,
    hideBalance,
    depositToken,
    totalDeposit,
    totalDepositUsd,
    vaultDeposit,
    notEarning,
  };
}

export const VaultDepositStat = memo<VaultDepositStatProps>(function VaultDepositStat({
  vaultId,
  walletAddress,
  label = 'VaultStat-DEPOSITED',
  ...passthrough
}) {
  const data = useAppSelector(state => selectData(state, vaultId, walletAddress));
  const classes = useStyles();

  if (data.loading) {
    return <VaultValueStat label={label} value="-" blur={false} loading={true} {...passthrough} />;
  }

  if (!('vaultDeposit' in data) || data.totalDeposit.isZero()) {
    return <VaultValueStat label={label} value="0" blur={false} loading={false} {...passthrough} />;
  }

  const hasDisplacedDeposit = data.vaultDeposit.lt(data.totalDeposit) || data.notEarning.gt(0);
  const isNotEarning = data.notEarning.gt(0);
  const depositFormatted = formatTokenDisplayCondensed(
    data.totalDeposit,
    data.depositToken.decimals,
    6
  );
  const IconComponent = isNotEarning ? ErrorOutline : InfoOutlined;

  return (
    <VaultValueStat
      label={label}
      value={
        isNotEarning ? (
          <div className={classes.depositWithIcon}>
            <IconComponent
              className={clsx(classes.depositIcon, {
                [classes.depositIconNotEarning]: isNotEarning,
              })}
            />
            {depositFormatted}
          </div>
        ) : (
          depositFormatted
        )
      }
      subValue={formatLargeUsd(data.totalDepositUsd)}
      blur={data.hideBalance}
      loading={false}
      tooltip={
        hasDisplacedDeposit ? (
          <VaultDepositedTooltip vaultId={vaultId} walletAddress={walletAddress} />
        ) : undefined
      }
      {...passthrough}
    />
  );
});
