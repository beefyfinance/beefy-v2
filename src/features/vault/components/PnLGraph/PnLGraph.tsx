import { makeStyles } from '@material-ui/core';
import React, { useCallback } from 'react';
import { memo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Title } from './components/Title';
// import { usePnLChartData } from './hooks';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface PnLGraphProps {
  vaultId: VaultEntity['id'];
}

export const PnLGraph = memo<PnLGraphProps>(function ({ vaultId }) {
  const classes = useStyles();

  const [stat, setStat] = React.useState<number>(0);

  const handleStat = useCallback((newStat: number) => {
    setStat(newStat);
  }, []);

  return (
    <div className={classes.pnlContainer}>
      <Title vaultId={vaultId} />
      <div className={classes.graphContainer}>
        <Graph stat={stat} vaultId={vaultId} />
      </div>
      <Footer stat={stat} handleStat={handleStat} />
    </div>
  );
});
