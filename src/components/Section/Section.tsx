import type { ReactNode } from 'react';
import { memo } from 'react';
import { Container, type ContainerProps } from '../Container/Container.tsx';
import { css } from '@repo/styles/css';

interface SectionHeaderProps {
  title?: string;
  subTitle?: string;
}

export const SectionHeader = memo(function SectionHeader({ title, subTitle }: SectionHeaderProps) {
  const titleContainerClass = css({
    marginBottom: '24px',
  });
  const titleClass = css({
    textStyle: 'h3',
    color: 'text.middle',
  });
  const subTitleClass = css({
    textStyle: 'body',
    color: 'text.dark',
    marginTop: '8px',
  });

  return (
    <Container maxWidth="lg" className={titleContainerClass}>
      {title && <div className={titleClass}>{title}</div>}
      {subTitle && <div className={subTitleClass}>{subTitle}</div>}
    </Container>
  );
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
  const sectionClass = css({
    marginTop: '48px',
    mdDown: {
      marginTop: '24px',
    },
  });

  return (
    <div className={sectionClass}>
      {(title || subTitle) && <SectionHeader title={title} subTitle={subTitle} />}
      <Container maxWidth={maxWidth} noPadding={noPadding}>
        {children}
      </Container>
    </div>
  );
});
