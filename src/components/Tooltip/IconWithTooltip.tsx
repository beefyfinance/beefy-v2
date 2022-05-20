import { memo } from 'react';
import { Tooltip, TooltipProps } from './Tooltip';
import { HelpOutline, SvgIconComponent } from '@material-ui/icons';
import { SvgIconProps } from '@material-ui/core/SvgIcon/SvgIcon';

export type IconWithTooltipProps = {
  Icon?: SvgIconComponent;
  iconProps?: SvgIconProps;
} & Omit<TooltipProps, 'children'>;

export const IconWithTooltip = memo<IconWithTooltipProps>(function IconWithTooltip({
  Icon = HelpOutline,
  iconProps,
  ...rest
}) {
  return (
    <Tooltip {...rest}>
      <Icon {...iconProps} />
    </Tooltip>
  );
});
