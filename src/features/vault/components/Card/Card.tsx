import React from 'react';
import { makeStyles, Paper } from '@material-ui/core';

import { styles } from './styles';

const useStyles = makeStyles(styles);
export const Card = ({ children }) => {
  const classes = useStyles();

  return <Paper className={classes.container}>{children}</Paper>;
};
