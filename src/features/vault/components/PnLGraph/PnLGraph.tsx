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

  // const data = usePnLChartData(
  //   1,
  //   'beefy:vault:optimism:0xe200cd5ef01b52bb968402f63e3933897cff367b',
  //   vaultId
  // );

  return (
    <div className={classes.pnlContainer}>
      <Title vaultId={vaultId} />
      <div className={classes.graphContainer}>
        <Graph />
      </div>
      <Footer />
    </div>
  );
});
