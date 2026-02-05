import type { ReactNode } from 'react';
import { memo } from 'react';
import { Container, type ContainerProps } from '../Container/Container.tsx';
import { styled } from '@repo/styles/jsx';

interface SectionHeaderProps {
  title?: string;
  subTitle?: string;
}

export const SectionHeader = memo(function SectionHeader({ title, subTitle }: SectionHeaderProps) {
  return (
    <SectionHeaderContainer maxWidth="lg">
      {title && <Title>{title}</Title>}
      {subTitle && <SubTitle>{subTitle}</SubTitle>}
    </SectionHeaderContainer>
  );
});

const Title = styled('div', {
  base: {
    textStyle: 'h3',
    color: 'text.middle',
  },
});
const SubTitle = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
    marginTop: '8px',
  },
});

const SectionHeaderContainer = styled(Container, {
  base: {
    gap: '8px',
  },
});

interface SectionProps {
  title?: string;
  subTitle?: string;
  children: ReactNode;
  maxWidth?: ContainerProps['maxWidth'];
  noPadding?: ContainerProps['noPadding'];
}

export const Section = memo(function Section({
  title,
  subTitle,
  children,
  maxWidth = 'lg',
  noPadding = false,
}: SectionProps) {
  return (
    <SectionContainer>
      {(title || subTitle) && <SectionHeader title={title} subTitle={subTitle} />}
      <Container maxWidth={maxWidth} noPadding={noPadding}>
        {children}
      </Container>
    </SectionContainer>
  );
});

const SectionContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});
