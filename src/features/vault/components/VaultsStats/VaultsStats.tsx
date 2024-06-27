import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import type { VaultEntity } from '../../../data/entities/vault';
import { isGovVault } from '../../../data/entities/vault';
import {
  selectVaultById,
  selectVaultLastHarvestByVaultId,
  selectVaultUnderlyingCowcentratedVaultIdOrUndefined,
} from '../../../data/selectors/vaults';
import { DailyApyStats, YearlyApyStats } from '../../../../components/ApyStats';
import { ValueBlock } from '../../../../components/ValueBlock/ValueBlock';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards';
import { useAppSelector } from '../../../../store';
import { formatDistance } from 'date-fns';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

function VaultsStatsComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  // FIXME 1) when we have vaults on top of CLM 2) rewardpool has harvests - we need to change this to show the actual vaults last harvest instead of underlying clm
  const underlyingCowcentratedId = useAppSelector(state =>
    selectVaultUnderlyingCowcentratedVaultIdOrUndefined(state, vaultId)
  );
  const lastHarvest = useAppSelector(state =>
    selectVaultLastHarvestByVaultId(state, underlyingCowcentratedId ?? vaultId)
  );
  const vault = useAppSelector(state =>
    selectVaultById(state, underlyingCowcentratedId ?? vaultId)
  );

  const lastHarvestFormatted = useMemo(() => {
    if (lastHarvest === 0) {
      return 'never';
    } else {
      return formatDistance(lastHarvest, new Date(), { addSuffix: true });
    }
  }, [lastHarvest]);

  return (
    <div className={classes.boxes}>
      <div className={clsx(classes.stats, classes.statsInterest)}>
        <div className={classes.stat}>
          <VaultTvl vaultId={vaultId} />
        </div>
        <div className={classes.stat}>
          <YearlyApyStats vaultId={vaultId} />
        </div>
        <div className={classes.stat}>
          <DailyApyStats vaultId={vaultId} />
        </div>
      </div>
      <div className={clsx(classes.stats, classes.statsDeposit)}>
        <div className={classes.stat}>
          <VaultDeposited vaultId={vaultId} />
        </div>
        {isGovVault(vault) ? (
          <div className={classes.stat}>
            <GovVaultRewards vaultId={vaultId} />
          </div>
        ) : lastHarvest ? (
          <div className={classes.stat}>
            <ValueBlock label={t('Vault-LastHarvest')} value={lastHarvestFormatted} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const VaultsStats = React.memo(VaultsStatsComponent);
