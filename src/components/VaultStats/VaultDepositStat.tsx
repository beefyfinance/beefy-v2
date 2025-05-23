import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectIsBalanceAvailableForChainUser,
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/prices.ts';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import ExclaimRoundedSquare from '../../images/icons/exclaim-rounded-square.svg?react';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent.tsx';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip.tsx';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';
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

// TODO better selector / hook
function selectVaultDepositStat(
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
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const data = useAppSelector(state => selectVaultDepositStat(state, vaultId, walletAddress));

  if (data.loading) {
    return (
      <VaultValueStat
        label={t(label)}
        value="-"
        blur={false}
        loading={true}
        expectSubValue={true}
        {...passthrough}
      />
    );
  }

  if (!('vaultDeposit' in data) || data.totalDeposit.isZero()) {
    return (
      <VaultValueStat label={t(label)} value="0" blur={false} loading={false} {...passthrough} />
    );
  }

  const hasDisplacedDeposit = data.vaultDeposit.lt(data.totalDeposit) || data.notEarning.gt(0);
  const isNotEarning = data.notEarning.gt(0);
  const depositFormattedCondensed = formatTokenDisplayCondensed(
    data.totalDeposit,
    data.depositToken.decimals,
    6
  );
  const depositFormattedFull = formatTokenDisplay(data.totalDeposit, data.depositToken.decimals);

  return (
    <VaultValueStat
      label={t(label)}
      value={depositFormattedCondensed}
      Icon={isNotEarning ? ExclaimRoundedSquare : undefined}
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
