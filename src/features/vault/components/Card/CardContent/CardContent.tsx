import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';

import { styles } from './styles';

interface CardContentProps {
  children: React.ReactNode;
  className?: any;
}

const useStyles = makeStyles(styles as any);
export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  const classes = useStyles();

  return <div className={className ?? classes.container}>{children}</div>;
};
