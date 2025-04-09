import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { memo } from 'react';
import type { BeefyState } from '../../redux-types.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
} from '../../features/data/selectors/balance.ts';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip.tsx';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { useAppSelector } from '../../store.ts';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import ErrorOutline from '../../images/icons/mui/ErrorOutline.svg?react';
import InfoOutlined from '../../images/icons/mui/InfoOutlined.svg?react';
import { css } from '@repo/styles/css';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
  label?: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

type SelectDataReturn =
  | {
      loading: true;
    }
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

  const totalDeposit = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
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
  const totalDepositUsd = selectUserVaultBalanceInUsdIncludingDisplaced(
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

export const VaultDepositStat = memo(function VaultDepositStat({
  vaultId,
  walletAddress,
  label = 'VaultStat-DEPOSITED',
  ...passthrough
}: VaultDepositStatProps) {
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
  const depositFormattedCondensed = formatTokenDisplayCondensed(
    data.totalDeposit,
    data.depositToken.decimals,
    6
  );
  const depositFormattedFull = formatTokenDisplay(data.totalDeposit, data.depositToken.decimals);
  const IconComponent = isNotEarning ? ErrorOutline : InfoOutlined;

  return (
    <VaultValueStat
      label={label}
      value={
        isNotEarning ?
          <div className={classes.depositWithIcon}>
            <IconComponent
              className={css(styles.depositIcon, isNotEarning && styles.depositIconNotEarning)}
            />
            {depositFormattedCondensed}
          </div>
        : depositFormattedCondensed
      }
      subValue={formatLargeUsd(data.totalDepositUsd)}
      blur={data.hideBalance}
      loading={false}
      tooltip={
        hasDisplacedDeposit ?
          <VaultDepositedTooltip vaultId={vaultId} walletAddress={walletAddress} />
        : <BasicTooltipContent title={depositFormattedFull} />
      }
      {...passthrough}
    />
  );
});
