import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { Footer } from './components/Footer';
import { Graph } from './components/Graph';
import { Title } from './components/Title';

import { styles } from './styles';

const useStyles = makeStyles(styles);

export const PnLGraph = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.pnlContainer}>
      <Title />
      <div className={classes.graphContainer}>
        <Graph />
      </div>
      <Footer />
    </div>
  );
});
