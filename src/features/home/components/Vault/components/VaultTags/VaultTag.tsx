import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { memo, ReactNode } from 'react';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultTagProps = {
  className?: string;
  children: ReactNode;
};
export const VaultTag = memo<VaultTagProps>(function VaultBoostTag({ children, className }) {
  const classes = useStyles();
  return <div className={clsx(classes.vaultTag, className)}>{children}</div>;
});
