import React, { memo, PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { LinkButton } from '../../../../../components/LinkButton';

const useStyles = makeStyles(styles);

export type CardActionsProps = PropsWithChildren<{}>;
export const CardActions = memo<CardActionsProps>(function ({ children }) {
  const classes = useStyles();

  return <div className={classes.actions}>{children}</div>;
});

export type CardActionProps = PropsWithChildren<{
  type: 'code' | 'link';
  href: string;
  text: string;
}>;
export const CardAction = memo<CardActionProps>(function ContentItem({ type, href, text }) {
  return <LinkButton type={type} href={href} text={text} />;
});
