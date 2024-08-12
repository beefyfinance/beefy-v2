import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { Tooltip, type TooltipProps } from '../Tooltip';
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
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'), { noSsr: true });
  const handleTooltipClick = useCallback<Exclude<TooltipProps['onTriggerClick'], undefined>>(e => {
    // don't bubble up to the link on whole row
    if (e) {
      e.preventDefault();
    }
  }, []);

  return (
    <div className={className}>
      {!lgUp && showLabel ? (
        <div className={classes.label}>
          <div className={clsx(classes.labelText, labelClassName)}>{label}</div>
        </div>
      ) : null}
      {tooltip ? (
        <div className={contentClassName}>
          <Tooltip
            triggerClass={triggerClassName}
            content={tooltip}
            onTriggerClick={handleTooltipClick}
          >
            {children}
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
          </Tooltip>
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
