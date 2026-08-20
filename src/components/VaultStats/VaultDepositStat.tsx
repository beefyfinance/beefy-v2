import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import { createCachedSelector } from 're-reselect';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInDepositToken,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/data-loader/prices.ts';
import {
  selectTokenByAddressOrUndefined,
  selectTokenPriceByAddress,
} from '../../features/data/selectors/tokens.ts';
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
import { selectIsBalanceAvailableForChainUser } from '../../features/data/selectors/data-loader/balance.ts';
export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
  label?: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

type SelectDataReturn =
  | {
      loading: true;
      hideBalance: boolean;
    }
  | {
      loading: false;
      totalDeposit: BigNumber;
      hideBalance: boolean;
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

const NO_DEPOSIT: Record<'true' | 'false', SelectDataReturn> = {
  true: { loading: false, totalDeposit: BIG_ZERO, hideBalance: true },
  false: { loading: false, totalDeposit: BIG_ZERO, hideBalance: false },
};
const STILL_LOADING: Record<'true' | 'false', SelectDataReturn> = {
  true: { loading: true, hideBalance: true },
  false: { loading: true, hideBalance: false },
};

const selectVaultDepositStat = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], _w?: string) => selectVaultById(state, vaultId),
  (state: BeefyState, _vaultId: VaultEntity['id'], w?: string) => w || selectWalletAddress(state),
  (state: BeefyState) => selectIsBalanceHidden(state),
  (state: BeefyState) => selectIsPricesAvailable(state),
  (state: BeefyState, vaultId: VaultEntity['id'], w?: string) => {
    const address = w || selectWalletAddress(state);
    return address ?
        selectIsBalanceAvailableForChainUser(
          state,
          selectVaultById(state, vaultId).chainId,
          address
        )
      : false;
  },
  (state: BeefyState, vaultId: VaultEntity['id'], w?: string) =>
    selectUserVaultBalanceInDepositTokenIncludingDisplaced(state, vaultId, w),
  (state: BeefyState, vaultId: VaultEntity['id'], w?: string) =>
    selectUserVaultBalanceNotInActiveBoostInDepositToken(state, vaultId, w),
  (state: BeefyState, vaultId: VaultEntity['id'], w?: string) =>
    selectUserVaultBalanceInDepositToken(state, vaultId, w),
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return selectTokenByAddressOrUndefined(state, vault.chainId, vault.depositTokenAddress);
  },
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  },
  (
    vault,
    walletAddress,
    hideBalance,
    pricesAvailable,
    balanceAvailable,
    totalDeposit,
    notEarning,
    vaultDeposit,
    depositToken,
    oraclePrice
  ): SelectDataReturn => {
    const key = hideBalance ? 'true' : 'false';

    if (!walletAddress) {
      return NO_DEPOSIT[key];
    }

    if (!pricesAvailable || !balanceAvailable) {
      return STILL_LOADING[key];
    }

    if (!totalDeposit.gt(0)) {
      return NO_DEPOSIT[key];
    }

    if (!depositToken) {
      throw new Error(`selectTokenByAddress: Unknown token address "${vault.depositTokenAddress}"`);
    }

    return {
      loading: false,
      hideBalance,
      depositToken,
      totalDeposit,
      totalDepositUsd: totalDeposit.multipliedBy(oraclePrice),
      vaultDeposit,
      notEarning,
    };
  }
)(
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    `${vaultId}-${walletAddress ?? ''}`
);

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
        blur={data.hideBalance}
        loading={true}
        expectSubValue={true}
        {...passthrough}
      />
    );
  }

  if (!('vaultDeposit' in data) || data.totalDeposit.isZero()) {
    return (
      <VaultValueStat
        label={t(label)}
        value="0"
        blur={data.hideBalance}
        loading={false}
        {...passthrough}
      />
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
