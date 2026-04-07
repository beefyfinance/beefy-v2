import { memo, type ReactNode } from 'react';
import { styled } from '@repo/styles/jsx';

interface TitleProps {
  text: ReactNode;
}

export const Title = memo(function Title({ text }: TitleProps) {
  return (
    <TitleContainer>
      <TitleText>{text}</TitleText>
    </TitleContainer>
  );
});

const TitleText = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'blackMarket',
    display: 'flex',
    alignItems: 'center',
  },
});

const TitleContainer = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: '0',
    marginBottom: '4px',
  },
});
