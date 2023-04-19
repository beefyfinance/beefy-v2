import { memo } from 'react';
import type { TooltipProps } from './Tooltip';
import { Tooltip } from './Tooltip';
import type { SvgIconComponent } from '@material-ui/icons';
import { HelpOutline } from '@material-ui/icons';
import type { SvgIconProps } from '@material-ui/core/SvgIcon/SvgIcon';
import type { BasicTooltipContentProps } from './BasicTooltipContent';
import { BasicTooltipContent } from './BasicTooltipContent';

export type IconWithBasicTooltipProps = {
  Icon?: SvgIconComponent;
  iconProps?: SvgIconProps;
} & BasicTooltipContentProps &
  Omit<TooltipProps, 'children' | 'content'>;

export const IconWithBasicTooltip = memo<IconWithBasicTooltipProps>(function IconWithBasicTooltip({
  Icon = HelpOutline,
  iconProps,
  title,
  content,
  ...rest
}) {
  return (
    <Tooltip {...rest} content={<BasicTooltipContent title={title} content={content} />}>
      <Icon {...iconProps} />
    </Tooltip>
  );
});
