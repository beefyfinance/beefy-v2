import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { CardTitleProps } from './CardTitleProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const CardTitle: React.FC<CardTitleProps> = ({ title, subtitle }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {typeof title === 'object' ? (
        <>{title}</>
      ) : (
        <Typography className={classes.title}>{title}</Typography>
      )}
      {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
    </div>
  );
};
