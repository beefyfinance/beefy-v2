import { type CSSProperties, memo, useMemo } from 'react';
import type { TooltipProps } from './Tooltip';
import { Tooltip } from './Tooltip';
import type { SvgIconComponent } from '@material-ui/icons';
import { HelpOutline } from '@material-ui/icons';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type IconWithTooltipProps = {
  Icon?: SvgIconComponent;
  iconClassName?: string;
  iconSize?: number;
} & Omit<TooltipProps, 'children'>;

export const IconWithTooltip = memo<IconWithTooltipProps>(function IconWithTooltip({
  Icon = HelpOutline,
  iconClassName,
  iconSize = 20,
  ...rest
}) {
  const classes = useStyles();
  const styles = useMemo(
    () => ({ '--tooltip-icon-size': `${iconSize}px` } as CSSProperties),
    [iconSize]
  );

  return (
    <Tooltip {...rest}>
      <Icon className={clsx(classes.icon, iconClassName)} style={styles} />
    </Tooltip>
  );
});
