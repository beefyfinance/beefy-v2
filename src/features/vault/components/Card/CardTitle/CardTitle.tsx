import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
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
        <Typography variant="h3" className={titleClassName ?? classes.title}>
          {title}
        </Typography>
      )}
      {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
    </>
  );
};
