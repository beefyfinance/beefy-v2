import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export type InternalLinkProps = {
  to: string;
  children?: ReactNode;
};

export const InternalLink = memo<InternalLinkProps>(function InternalLink({ to, children }) {
  const classes = useStyles();
  return (
    <Link to={to} className={classes.link}>
      {children}
    </Link>
  );
});

export type ExternalLinkProps = {
  href: string;
  children?: ReactNode;
};

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({ href, children }) {
  const classes = useStyles();
  return (
    <a href={href} target="_blank" rel="noopener" className={classes.link}>
      {children}
    </a>
  );
});

export type ButtonLinkProps = {
  onClick: () => void;
  children?: ReactNode;
};

export const ButtonLink = memo<ButtonLinkProps>(function ButtonLink({ onClick, children }) {
  const classes = useStyles();
  return (
    <span onClick={onClick} className={classes.link}>
      {children}
    </span>
  );
});
