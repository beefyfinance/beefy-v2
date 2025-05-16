import { css } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { isGovVault, type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  DashboardDataStatus,
  selectDashboardUserRewardsOrStatusByVaultId,
} from '../../features/data/selectors/dashboard.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import {
  PendingRewardsIconWithTooltip,
  RewardsTooltipContent,
} from '../RewardsTooltip/RewardsTooltip.tsx';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import { styles } from './styles.ts';
import { useTranslation } from 'react-i18next';
export type VaultYieldRewardsStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;

export const VaultYieldRewardsStat = memo(function VaultYieldRewardsStat({
  vaultId,
  walletAddress,
  ...passthrough
}: VaultYieldRewardsStatProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const label = isGovVault(vault) ? 'VaultStat-Claimable-Rewards' : 'VaultStat-Yield';
  const data = useAppSelector(state =>
    selectDashboardUserRewardsOrStatusByVaultId(state, vaultId, walletAddress)
  );
  const received = useMemo(() => {
    if (typeof data === 'object' && (data.compounded.has || data.claimed.has)) {
      const compoundedDepositRewards = data.compounded.rewards.filter(
        r => r.token.chainId === vault.chainId && r.token.address === vault.depositTokenAddress
      );
      const depositToken =
        (
          !data.claimed.has &&
          compoundedDepositRewards.length &&
          compoundedDepositRewards.length === data.compounded.rewards.length
        ) ?
          compoundedDepositRewards[0].token
        : undefined;
      const totalDepositYield =
        depositToken ?
          compoundedDepositRewards.reduce((sum, r) => sum.plus(r.amount), BIG_ZERO)
        : BIG_ZERO;

      return {
        depositToken,
        totalDepositYield,
        usd: data.compounded.usd.plus(data.claimed.usd),
      };
    }
  }, [data, vault]);

  if (data === DashboardDataStatus.Loading) {
    return (
      <VaultValueStat
        label={t(label)}
        value="-"
        loading={true}
        expectSubValue={true}
        {...passthrough}
      />
    );
  }

  if (data === DashboardDataStatus.Missing) {
    return <VaultValueStat label={label} value="?" loading={false} {...passthrough} />;
  }

  if (!data.all.has) {
    // this probably means some tx is missing from timeline
    return <VaultValueStat label={label} value="-" loading={false} {...passthrough} />;
  }

  // compounded yield + claimed rewards (+ claimable rewards)
  if (received) {
    return (
      <VaultValueStat
        label={'VaultStat-Yield'}
        value={
          <>
            <DivWithTooltip
              tooltip={<RewardsTooltipContent compounded={true} claimed={true} rewards={data} />}
              className={css(styles.tooltipTrigger, styles.textGreen, styles.textOverflow)}
              data-x={1}
            >
              {received.depositToken ?
                formatTokenDisplayCondensed(
                  received.totalDepositYield,
                  received.depositToken.decimals,
                  6
                )
              : formatLargeUsd(received.usd)}
            </DivWithTooltip>
            {data.pending.has && (
              <>
                <div>+</div>
                <PendingRewardsIconWithTooltip size={20} rewards={data} />
              </>
            )}
          </>
        }
        subValue={
          received.depositToken ? formatLargeUsd(received.usd) : formatLargeUsd(data.all.usd)
        }
        loading={false}
        {...passthrough}
      />
    );
  }

  // Only claimable rewards
  // TODO label will be wrong if pending includes pending yield (not claimable)
  return (
    <VaultValueStat
      label={'VaultStat-Claimable-Rewards'}
      value={<PendingRewardsIconWithTooltip size={20} rewards={data} />}
      subValue={formatLargeUsd(data.pending.usd)}
      loading={false}
      {...passthrough}
    />
  );
});
