import { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { CardTitleProps } from './CardTitleProps';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const CardTitle: FC<CardTitleProps> = ({ title, subtitle, titleClassName }) => {
  const classes = useStyles();

  return (
    <>
      {typeof title === 'object' ? (
        <>{title}</>
      ) : (
        <h2 className={clsx(classes.title, titleClassName)}>{title}</h2>
      )}
      {subtitle && <div className={classes.subtitle}>{subtitle}</div>}
    </>
  );
};
