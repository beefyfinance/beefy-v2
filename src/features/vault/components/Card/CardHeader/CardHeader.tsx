import React from 'react';
import { CardHeaderProps, makeStyles } from '@material-ui/core';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  const classes = useStyles();

  return <div className={className ? className : classes.container}>{children}</div>;
};
