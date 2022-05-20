import { memo } from 'react';
import { Tooltip, TooltipProps } from './Tooltip';
import { HelpOutline, SvgIconComponent } from '@material-ui/icons';
import { SvgIconProps } from '@material-ui/core/SvgIcon/SvgIcon';
import { BasicTooltipContent, BasicTooltipContentProps } from './BasicTooltipContent';

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
