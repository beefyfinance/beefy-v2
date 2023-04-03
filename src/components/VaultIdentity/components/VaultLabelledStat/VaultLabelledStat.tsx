import React, { memo, ReactNode } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { Theme } from '@material-ui/core/styles';
import { IconWithTooltip, Tooltip } from '../../../Tooltip';

const useStyles = makeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  showLabel?: boolean;
  tooltip?: ReactNode;
  children: ReactNode;
  triggerClassName?: string;
};
export const VaultLabelledStat = memo<VaultLabelledStatProps>(function VaultLabelledStat({
  label,
  children,
  tooltip,
  showLabel = true,
  triggerClassName,
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
      {tooltip ? (
        <Tooltip triggerClass={triggerClassName} content={tooltip}>
          <div>{children}</div>
        </Tooltip>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
});
