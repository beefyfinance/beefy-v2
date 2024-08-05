import React, { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';

const useStyles = makeStyles(styles);

export type ExternalLinkProps = {
  href: string;
  icon?: boolean;
  className?: string;
  children: ReactNode;
};

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({
  href,
  icon,
  className,
  children,
}) {
  const classes = useStyles();
  return (
    <a className={clsx(classes.link, className)} href={href} target="_blank" rel="noreferrer">
      {children}
      {icon ? <OpenInNewRoundedIcon width={16} height={16} className={classes.icon} /> : null}
    </a>
  );
});
