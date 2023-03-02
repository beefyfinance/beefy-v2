import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { BasicTabs } from '../../../../../../components/Tabs/BasicTabs';
import { VaultEntity } from '../../../../../data/entities/vault';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface FooterProps {
  stat: number;
  handleStat: (stat: number) => any;
  vaultId: VaultEntity['id'];
  labels: string[];
}

export const Footer = memo<FooterProps>(function ({ stat, handleStat, vaultId, labels }) {
  const classes = useStyles();

  return (
    <div className={classes.footer}>
      <div className={classes.tabsContainer}>
        <BasicTabs labels={labels} value={stat} onChange={newValue => handleStat(newValue)} />
      </div>
    </div>
  );
});
