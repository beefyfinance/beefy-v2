import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { Graph } from './components/Graph';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const PnLGraph = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.pnlContainer}>
      <div className={classes.title}>title</div>
      <div className={classes.graphContainer}>
        <Graph />
      </div>
      <div className={classes.footer}>footer</div>
    </div>
  );
});
