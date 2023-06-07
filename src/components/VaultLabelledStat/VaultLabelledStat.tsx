import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { IconWithTooltip, Tooltip } from '../Tooltip';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  showLabel?: boolean;
  tooltip?: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  subValue?: ReactNode;
  blur?: boolean;
  boosted?: boolean;
  contentClassName?: string;
};
export const VaultLabelledStat = memo<VaultLabelledStatProps>(function VaultLabelledStat({
  label,
  children,
  tooltip,
  showLabel = true,
  className,
  triggerClassName,
  labelClassName,
  subValue,
  blur,
  boosted,
  contentClassName,
}) {
  const classes = useStyles();

  return (
    <div className={className}>
      {showLabel ? (
        <div className={classes.label}>
          <div className={clsx(classes.labelText, labelClassName)}>{label}</div>
          {tooltip ? (
            <IconWithTooltip content={tooltip} triggerClass={classes.tooltipTrigger} />
          ) : null}
        </div>
      ) : null}
      {tooltip ? (
        <div className={contentClassName}>
          <Tooltip triggerClass={triggerClassName} content={tooltip}>
            {children}
          </Tooltip>
          {subValue && (
            <div
              className={clsx(classes.subValue, {
                [classes.blurValue]: blur,
                [classes.lineThroughValue]: boosted,
              })}
            >
              {subValue}
            </div>
          )}
        </div>
      ) : (
        <div className={contentClassName}>
          <div className={triggerClassName}>{children}</div>
          {subValue && (
            <div
              className={clsx(classes.subValue, {
                [classes.blurValue]: blur,
                [classes.lineThroughValue]: boosted,
              })}
            >
              {subValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
