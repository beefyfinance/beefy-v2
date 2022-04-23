import React, { memo, ReactNode } from 'react';
import { Hidden, makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  tooltip?: ReactNode;
  children: ReactNode;
};
export const VaultLabelledStat = memo<VaultLabelledStatProps>(function VaultLabelledStat({
  label,
  children,
  tooltip,
}) {
  const classes = useStyles();

  return (
    <div>
      <Hidden lgUp>
        <div className={classes.label}>
          {label} {tooltip}
        </div>
      </Hidden>
      <div>{children}</div>
    </div>
  );
});
