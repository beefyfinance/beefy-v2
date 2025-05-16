import { css } from '@repo/styles/css';
import { formatDistanceToNowStrict } from 'date-fns';
import { Fragment, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isCowcentratedStandardVault,
  isGovVault,
  isGovVaultCowcentrated,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultStandardCowcentrated,
} from '../../features/data/entities/vault.ts';
import {
  selectVaultById,
  selectVaultLastHarvestByVaultId,
} from '../../features/data/selectors/vaults.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';

type LastHarvestProps = {
  vaultId: VaultEntity['id'];
};

export const LastHarvest = memo(function LastHarvest({ vaultId }: LastHarvestProps) {
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

export const LastHarvestStandard = memo(function LastHarvestStandard({
  vaultId,
}: LastHarvestProps) {
  const { t } = useTranslation();
  const lastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, vaultId));
  const formatted = useMemo(() => formatLastHarvest(lastHarvest), [lastHarvest]);

  return <ValueBlock label={t('Vault-LastHarvest')} value={formatted} />;
});

type LastHarvestCowcentratedProps = {
  vaultId: VaultStandardCowcentrated['id'];
  clmId: VaultCowcentrated['id'];
};

const useLastHarvestStyles = legacyMakeStyles({
  tooltip: css.raw({
    textStyle: 'body',
    display: 'grid',
    rowGap: '8px',
    columnGap: '16px',
    gridTemplateColumns: '1fr auto',
  }),
  label: css.raw({
    color: 'colorPalette.text.label',
  }),
  value: css.raw({
    color: 'colorPalette.text.item',
    textAlign: 'right',
  }),
});

export const LastHarvestCowcentratedVault = memo(function LastHarvestCowcentratedVault({
  vaultId,
  clmId,
}: LastHarvestCowcentratedProps) {
  const { t } = useTranslation();
  const classes = useLastHarvestStyles();
  const vaultLastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, vaultId));
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
        data.showTooltip ?
          <div className={classes.tooltip}>
            {data.harvests.map(({ type, formatted }) => (
              <Fragment key={type}>
                <div className={classes.label}>{t(`Vault-LastHarvest-Label-${type}`)}</div>
                <div className={classes.value}>{formatted}</div>
              </Fragment>
            ))}
          </div>
        : undefined
      }
    />
  );
});
