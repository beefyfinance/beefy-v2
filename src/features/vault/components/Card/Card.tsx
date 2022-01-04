import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Paper from '@material-ui/core/Paper';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const Card = ({ children }) => {
  const classes = useStyles();

  return <Paper className={classes.container}>{children}</Paper>;
};
