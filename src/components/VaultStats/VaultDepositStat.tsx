import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectUserVaultNotEarningBalanceInDepositToken,
} from '../../features/data/selectors/balance';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import { selectIsBalanceHidden, selectWalletAddress } from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader';
import { BIG_ZERO } from '../../helpers/big-number';
import { useAppSelector } from '../../store';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ErrorOutline } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

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
function selectData(state: BeefyState, vaultId: VaultEntity['id']): SelectDataReturn {
  const vault = selectVaultById(state, vaultId);
  const walletAddress = selectWalletAddress(state);
  if (!walletAddress) {
    return { loading: false, totalDeposit: BIG_ZERO };
  }

  const isLoaded =
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  if (!isLoaded) {
    return { loading: true };
  }

  const totalDeposit = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(state, vault.id);
  if (!totalDeposit.gt(0)) {
    return { loading: false, totalDeposit: BIG_ZERO };
  }

  const hideBalance = selectIsBalanceHidden(state);
  const notEarning = selectUserVaultNotEarningBalanceInDepositToken(state, vault.id);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalDepositUsd = selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId);
  const vaultDeposit = selectUserVaultBalanceInDepositToken(state, vault.id);

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
  className,
}) {
  const label = 'VaultStat-DEPOSITED';
  const data = useAppSelector(state => selectData(state, vaultId));
  const classes = useStyles();

  if (data.loading) {
    return (
      <VaultValueStat label={label} value="-" blur={false} loading={true} className={className} />
    );
  }

  if (!('vaultDeposit' in data) || data.totalDeposit.isZero()) {
    return (
      <VaultValueStat label={label} value="0" blur={false} loading={false} className={className} />
    );
  }

  return (
    <VaultValueStat
      label={label}
      value={
        data.notEarning.isZero() ? (
          formatTokenDisplayCondensed(data.totalDeposit, data.depositToken.decimals, 6)
        ) : (
          <div className={classes.notEarning}>
            <ErrorOutline className={classes.notEarningIcon} />
            {formatTokenDisplayCondensed(data.totalDeposit, data.depositToken.decimals, 6)}
          </div>
        )
      }
      subValue={formatLargeUsd(data.totalDepositUsd)}
      blur={data.hideBalance}
      loading={false}
      className={className}
      tooltip={
        data.vaultDeposit.lt(data.totalDeposit) || data.notEarning.gt(0) ? (
          <VaultDepositedTooltip vaultId={vaultId} />
        ) : undefined
      }
    />
  );
});
