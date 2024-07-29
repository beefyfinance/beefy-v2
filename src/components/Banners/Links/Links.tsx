import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type CommonLinkProps = {
  children?: ReactNode;
  className?: string;
};

export type InternalLinkProps = {
  to: string;
} & CommonLinkProps;

export const InternalLink = memo<InternalLinkProps>(function InternalLink({
  to,
  children,
  className,
}) {
  const classes = useStyles();
  return (
    <Link to={to} className={clsx(classes.link, className)}>
      {children}
    </Link>
  );
});

export type ExternalLinkProps = {
  href: string;
} & CommonLinkProps;

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({
  href,
  children,
  className,
}) {
  const classes = useStyles();
  return (
    <a href={href} target="_blank" rel="noopener" className={clsx(classes.link, className)}>
      {children}
    </a>
  );
});

export type ButtonLinkProps = {
  onClick: () => void;
} & CommonLinkProps;

export const ButtonLink = memo<ButtonLinkProps>(function ButtonLink({
  onClick,
  children,
  className,
}) {
  const classes = useStyles();
  return (
    <span onClick={onClick} className={clsx(classes.link, className)}>
      {children}
    </span>
  );
});
