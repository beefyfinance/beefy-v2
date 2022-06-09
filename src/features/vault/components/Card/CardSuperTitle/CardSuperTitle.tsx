import React, { memo, PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type CardSuperTitleProps = PropsWithChildren<{
  text: string;
}>;
export const CardSuperTitle = memo<CardSuperTitleProps>(function ({ text }) {
  const classes = useStyles();

  return <div className={classes.supertitle}>{text}</div>;
});
