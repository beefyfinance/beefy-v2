import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { LinkButton } from '../../../../../components/LinkButton';

const useStyles = makeStyles(styles);

export type CardActionsProps = { children: ReactNode };

export const CardActions = memo<CardActionsProps>(function CardActions({ children }) {
  const classes = useStyles();

  return <div className={classes.actions}>{children}</div>;
});

export type CardActionProps = {
  type: 'code' | 'link';
  href: string;
  text: string;
};
export const CardAction = memo<CardActionProps>(function CardAction({ type, href, text }) {
  return <LinkButton type={type} href={href} text={text} />;
});
