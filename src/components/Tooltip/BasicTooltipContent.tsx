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
      {content ?
        <Text>{content}</Text>
      : null}
    </>
  );
});

const Title = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'colorPalette.text.title',
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'body',
    color: 'colorPalette.text.content',
    whiteSpace: 'pre-wrap',
  },
});
