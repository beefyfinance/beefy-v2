import { makeStyles } from '@material-ui/core';
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

  return (
    <div className={classes.pnlContainer}>
      <Title vaultId={vaultId} />
      <div className={classes.graphContainer}>
        <Graph vaultId={vaultId} />
      </div>
      <Footer />
    </div>
  );
});
