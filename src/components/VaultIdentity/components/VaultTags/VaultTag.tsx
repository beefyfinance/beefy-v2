import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { ReactNode } from 'react';
import { forwardRef, memo } from 'react';
import clsx from 'clsx';
import type { TooltipProps } from '../../../Tooltip';
import { Tooltip } from '../../../Tooltip';

const useStyles = makeStyles(styles);

export type VaultTagProps = {
  className?: string;
  icon?: ReactNode;
  text: ReactNode;
};
export const VaultTag = memo(
  forwardRef<HTMLDivElement, VaultTagProps>(function VaultTag({ icon, text, className }, ref) {
    const classes = useStyles();
    return (
      <div className={clsx(classes.vaultTag, className)} ref={ref}>
        {icon ? <div className={classes.vaultTagIcon}>{icon}</div> : null}
        {text ? <div className={classes.vaultTagText}>{text}</div> : null}
      </div>
    );
  })
);

export type VaultTagWithTooltipProps = VaultTagProps & Omit<TooltipProps, 'children'>;

export const VaultTagWithTooltip = memo(
  forwardRef<HTMLDivElement, VaultTagWithTooltipProps>(function VaultTagWithTooltip(
    { icon, text, className, triggerClass, ...rest },
    ref
  ) {
    const classes = useStyles();
    return (
      <Tooltip triggerClass={clsx(classes.vaultTag, className, triggerClass)} ref={ref} {...rest}>
        {icon ? <div className={classes.vaultTagIcon}>{icon}</div> : null}
        {text ? <div className={classes.vaultTagText}>{text}</div> : null}
      </Tooltip>
    );
  })
);
