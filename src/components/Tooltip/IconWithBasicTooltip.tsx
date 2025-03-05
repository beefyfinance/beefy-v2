import { memo } from 'react';
import type { BasicTooltipContentProps } from './BasicTooltipContent.tsx';
import { BasicTooltipContent } from './BasicTooltipContent.tsx';
import { IconWithTooltip, type IconWithTooltipProps } from './IconWithTooltip.tsx';

export type IconWithBasicTooltipProps = BasicTooltipContentProps &
  Omit<IconWithTooltipProps, 'title' | 'tooltip'>;

export const IconWithBasicTooltip = memo(function IconWithBasicTooltip({
  title,
  content,
  ...rest
}: IconWithBasicTooltipProps) {
  return (
    <IconWithTooltip tooltip={<BasicTooltipContent title={title} content={content} />} {...rest} />
  );
});
