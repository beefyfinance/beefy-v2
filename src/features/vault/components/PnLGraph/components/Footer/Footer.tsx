import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '../../../../../../components/Tabs';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface FooterProps {
  stat: number;
  handleStat: (stat: number) => any;
}

export const Footer = memo<FooterProps>(function ({ stat, handleStat }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();
  const classes = useStyles();

  const labels = ['1D', '1W', '1M', '1Y'];

  return (
    <div className={classes.footer}>
      <div className={classes.items}>
        <LegendItem color="#59A662" text="WBTC amount" />
        <LegendItem color="#6A88C8" text="Deposit Value (USD)" />
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
