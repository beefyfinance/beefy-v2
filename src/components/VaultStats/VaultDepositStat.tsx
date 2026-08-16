import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { selectVaultDepositStatData } from '../../features/data/selectors/vault-stats.ts';
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
import { type ClmFamilySide, ClmFamilySideLine } from './ClmFamilyShared.tsx';
export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
  label?: string;
  clmSide?: ClmFamilySide;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const VaultDepositStat = memo(function VaultDepositStat({
  vaultId,
  walletAddress,
  label = 'VaultStat-DEPOSITED',
  clmSide,
  ...passthrough
}: VaultDepositStatProps) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectVaultDepositStatData(state, vaultId, walletAddress));

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
        value={clmSide ? <ClmFamilySideLine side={clmSide}>0</ClmFamilySideLine> : '0'}
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
      value={
        clmSide ?
          <ClmFamilySideLine side={clmSide}>{depositFormattedCondensed}</ClmFamilySideLine>
        : depositFormattedCondensed
      }
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
