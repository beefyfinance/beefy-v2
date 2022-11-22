import React, { memo, ReactNode } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { IconWithTooltip, Tooltip } from '../../../../../../components/Tooltip';
import { Theme } from '@material-ui/core/styles';

const useStyles = makeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  showLabel?: boolean;
  tooltip?: ReactNode;
  children: ReactNode;
};
export const VaultLabelledStat = memo<VaultLabelledStatProps>(function VaultLabelledStat({
  label,
  children,
  tooltip,
  showLabel = true,
}) {
  const classes = useStyles();
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return (
    <div>
      {!lgUp && showLabel ? (
        <div className={classes.label}>
          <div className={classes.labelText}>{label}</div>
          {tooltip ? (
            <IconWithTooltip content={tooltip} triggerClass={classes.tooltipTrigger} />
          ) : null}
        </div>
      ) : null}
      {lgUp && tooltip ? (
        <Tooltip content={tooltip}>
          <div>{children}</div>
        </Tooltip>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
});
