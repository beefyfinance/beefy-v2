import { memo } from 'react';
import type { BasicTooltipContentProps } from './BasicTooltipContent';
import { BasicTooltipContent } from './BasicTooltipContent';
import { IconWithTooltip, type IconWithTooltipProps } from './IconWithTooltip';

export type IconWithBasicTooltipProps = BasicTooltipContentProps &
  Omit<IconWithTooltipProps, 'title' | 'content'>;

export const IconWithBasicTooltip = memo<IconWithBasicTooltipProps>(function IconWithBasicTooltip({
  title,
  content,
  ...rest
}) {
  return (
    <IconWithTooltip content={<BasicTooltipContent title={title} content={content} />} {...rest} />
  );
});
