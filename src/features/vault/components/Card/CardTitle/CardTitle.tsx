import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { CardTitleProps } from './CardTitleProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const CardTitle: React.FC<CardTitleProps> = ({ title, subtitle, titleClassName }) => {
  const classes = useStyles();

  return (
    <>
      {typeof title === 'object' ? (
        <>{title}</>
      ) : (
        <Typography className={titleClassName ?? classes.title}>{title}</Typography>
      )}
      {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
    </>
  );
};
