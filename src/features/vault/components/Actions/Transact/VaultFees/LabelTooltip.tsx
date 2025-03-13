import { memo } from 'react';
import type { BasicTooltipContentProps } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import type { IconWithTooltipProps } from '../../../../../../components/Tooltip/IconWithTooltip.tsx';
import { IconWithTooltip } from '../../../../../../components/Tooltip/IconWithTooltip.tsx';
import { css } from '@repo/styles/css';

const triggerCss = css.raw({
  width: '16px',
  height: '16px',
  margin: '0',
  verticalAlign: 'middle',
  display: 'inline-block',
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

export type LabelTooltipProps = BasicTooltipContentProps;

export const LabelTooltip = memo(function LabelTooltip({ title, content }: LabelTooltipProps) {
  return (
    <IconWithTooltip
      iconCss={triggerCss}
      tooltip={<BasicTooltipContent title={title} content={content} />}
    />
  );
});

export type LabelCustomTooltipProps = Omit<IconWithTooltipProps, 'triggerCss'>;

export const LabelCustomTooltip = memo(function LabelCustomTooltip(props: LabelCustomTooltipProps) {
  return <IconWithTooltip iconCss={triggerCss} {...props} />;
});
