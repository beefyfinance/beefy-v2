import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '../../../../../../components/Tabs';
import { useAppSelector } from '../../../../../../store';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface FooterProps {
  stat: number;
  handleStat: (stat: number) => any;
  vaultId: VaultEntity['id'];
}

export const Footer = memo<FooterProps>(function ({ stat, handleStat, vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const labels = ['1D', '1W', '1M', '1Y'];

  return (
    <div className={classes.footer}>
      <div className={classes.items}>
        <LegendItem
          color="#59A662"
          text={t('pnl-graph-legend-amount', { vaultName: vault.name })}
        />
        <LegendItem color="#6A88C8" text={t('pnl-graph-legend-usd')} />
      </div>
      <div className={classes.tabsContainer}>
        <Tabs labels={labels} value={stat} onChange={newValue => handleStat(newValue)} />
      </div>
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
