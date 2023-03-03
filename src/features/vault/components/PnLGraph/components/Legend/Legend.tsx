import { makeStyles, Theme } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';

const useStyles = makeStyles((theme: Theme) => ({
  items: {
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
    padding: '0px 24px',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
      padding: '0px 16px ',
    },
  },
  colorReference: {
    height: '2px',
    width: '12px',
  },
  legendItem: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    fontWeight: 700,
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
}));

export interface LegendProps {
  vaultId: VaultEntity['id'];
}

export const Legend = memo<LegendProps>(function ({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const isSingleAssetVault = useMemo(() => {
    return vault.assetIds.length === 1;
  }, [vault.assetIds.length]);

  return (
    <div className={classes.items}>
      <LegendItem
        color="#59A662"
        text={t(
          isSingleAssetVault ? 'pnl-graph-legend-amount-single' : 'pnl-graph-legend-amount-lp',
          {
            token: vault.assetIds[0],
          }
        )}
      />
      <LegendItem color="#5C99D6" text={t('pnl-graph-legend-usd')} />
    </div>
  );
});

interface LegendItemProps {
  color: string;
  text: string;
}

const LegendItem = memo<LegendItemProps>(function ({ color, text }) {
  const classes = useStyles();

  return (
    <div className={classes.legendItem}>
      <div className={classes.colorReference} style={{ backgroundColor: color }} />
      <div>{text}</div>
    </div>
  );
});
