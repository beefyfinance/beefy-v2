import type { ReactNode } from 'react';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';

export type BasicTooltipContentProps = {
  title: string;
  content?: ReactNode;
};

export const BasicTooltipContent = memo(function BasicTooltipContent({
  title,
  content,
}: BasicTooltipContentProps) {
  return (
    <>
      <Title>{title}</Title>
      {content ? <Text>{content}</Text> : null}
    </>
  );
});

const Title = styled('div', {
  base: {
    textStyle: 'body.med',
    fontSize: 'var(--tooltip-body-font-size, {fontSizes.body})',
    color: 'var(--tooltip-title-color, black)',
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'body',
    fontSize: 'var(--tooltip-body-font-size, {fontSizes.body})',
    color: 'var(--tooltip-content-color, black)',
  },
});
