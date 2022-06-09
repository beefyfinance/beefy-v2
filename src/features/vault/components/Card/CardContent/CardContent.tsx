import React from 'react';
import { makeStyles } from '@material-ui/core';

import { styles } from './styles';

interface CardContentProps {
  children: React.ReactNode;
  className?: any;
}

const useStyles = makeStyles(styles);
export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  const classes = useStyles();

  return <div className={className ?? classes.container}>{children}</div>;
};
