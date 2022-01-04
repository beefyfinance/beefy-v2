import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { CardHeaderProps } from '@material-ui/core/CardHeader';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  const classes = useStyles();

  return <div className={className ? className : classes.container}>{children}</div>;
};
