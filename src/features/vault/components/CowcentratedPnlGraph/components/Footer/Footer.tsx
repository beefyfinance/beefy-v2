import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { BasicTabs } from '../../../../../../components/Tabs/BasicTabs';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

interface FooterProps {
  period: number;
  handlePeriod: (period: number) => void;
  vaultId: VaultEntity['id'];
  labels: string[];
  tabsClassName?: string;
}

export const Footer = memo<FooterProps>(function Footer({
  period,
  handlePeriod,
  labels,
  tabsClassName,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.footer}>
      <div className={classes.legendContainer}>
        <div className={classes.usdReferenceLine} />
        {t('Position Value')}
      </div>
      <div className={clsx(classes.tabsContainer, tabsClassName)}>
        <BasicTabs
          onChange={(newValue: number) => handlePeriod(newValue)}
          labels={labels}
          value={period}
        />
      </div>
    </div>
  );
});
