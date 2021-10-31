import React from 'react';
import { makeStyles } from '@material-ui/core';

import styles from './styles';

const useStyles = makeStyles(styles);

const CardContent = ({ children }) => {
  const classes = useStyles();

  return <div className={classes.container}>{children}</div>;
};

export default CardContent;
