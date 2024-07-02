import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type DescriptionLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export const DescriptionLink = memo<DescriptionLinkProps>(function DescriptionLink({
  href,
  label,
  className,
}) {
  const classes = useStyles();

  return (
    <a className={clsx(classes.link, className)} target="_blank" rel="noopener" href={href}>
      {label}
    </a>
  );
});
