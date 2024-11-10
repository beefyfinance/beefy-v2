import { Fragment, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isCowcentratedStandardVault,
  isGovVault,
  isGovVaultCowcentrated,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultStandardCowcentrated,
} from '../../features/data/entities/vault';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import {
  selectVaultById,
  selectVaultLastHarvestByVaultId,
} from '../../features/data/selectors/vaults';
import { formatDistanceToNowStrict } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import type { Theme } from '@material-ui/core';

type LastHarvestProps = { vaultId: VaultEntity['id'] };

export const LastHarvest = memo<LastHarvestProps>(function LastHarvest({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isCowcentratedStandardVault(vault)) {
    return <LastHarvestCowcentratedVault vaultId={vault.id} clmId={vault.cowcentratedIds.clm} />;
  }

  if (isGovVault(vault) && !isGovVaultCowcentrated(vault)) {
    return null;
  }

  return <LastHarvestStandard vaultId={vaultId} />;
});

function formatLastHarvest(unixTime: number): string {
  if (unixTime === 0) {
    return '-';
  } else {
    return formatDistanceToNowStrict(unixTime, {
      addSuffix: true,
    });
  }
}

export const LastHarvestStandard = memo<LastHarvestProps>(function LastHarvestStandard({
  vaultId,
}) {
  const { t } = useTranslation();
  const lastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, vaultId));
  const formatted = useMemo(() => formatLastHarvest(lastHarvest), [lastHarvest]);

  return <ValueBlock label={t('Vault-LastHarvest')} value={formatted} />;
});

type LastHarvestCowcentratedProps = {
  vaultId: VaultStandardCowcentrated['id'];
  clmId: VaultCowcentrated['id'];
};

const useLastHarvestStyles = makeStyles((theme: Theme) => ({
  tooltip: {
    ...theme.typography['body-lg'],
    display: 'grid',
    rowGap: '8px',
    columnGap: '16px',
    gridTemplateColumns: '1fr auto',
  },
  label: {
    color: 'var(--tooltip-label-color)',
  },
  value: {
    color: 'var(--tooltip-value-color)',
    textAlign: 'right' as const,
  },
}));

export const LastHarvestCowcentratedVault = memo<LastHarvestCowcentratedProps>(
  function LastHarvestCowcentratedVault({ vaultId, clmId }) {
    const { t } = useTranslation();
    const classes = useLastHarvestStyles();
    const vaultLastHarvest = useAppSelector(state =>
      selectVaultLastHarvestByVaultId(state, vaultId)
    );
    const clmLastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, clmId));
    const data = useMemo(() => {
      const harvests = [
        {
          type: 'clm-vault',
          timestamp: vaultLastHarvest,
          formatted: formatLastHarvest(vaultLastHarvest),
        },
        {
          type: 'clm-pool',
          timestamp: clmLastHarvest,
          formatted: formatLastHarvest(clmLastHarvest),
        },
      ].sort(({ timestamp: a }, { timestamp: b }) => b - a);
      const showTooltip = vaultLastHarvest && clmLastHarvest;

      return { harvests, showTooltip };
    }, [vaultLastHarvest, clmLastHarvest]);

    if (!vaultLastHarvest && !clmLastHarvest) {
      return <ValueBlock label={t('Vault-LastHarvest')} value="-" />;
    }

    return (
      <ValueBlock
        label={t('Vault-LastHarvest')}
        value={data.harvests[0].formatted}
        usdValue={t(`Vault-LastHarvest-Label-${data.harvests[0].type}`)}
        tooltip={
          data.showTooltip ? (
            <div className={classes.tooltip}>
              {data.harvests.map(({ type, formatted }) => (
                <Fragment key={type}>
                  <div className={classes.label}>{t(`Vault-LastHarvest-Label-${type}`)}</div>
                  <div className={classes.value}>{formatted}</div>
                </Fragment>
              ))}
            </div>
          ) : undefined
        }
      />
    );
  }
);
