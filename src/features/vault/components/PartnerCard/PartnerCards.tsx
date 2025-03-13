import { css } from '@repo/styles/css';
import { memo, type ReactNode } from 'react';
import { Collapsable } from '../../../../components/Collapsable/Collapsable.tsx';

export type PartnerCardsProps = {
  title: string;
  openByDefault?: boolean;
  children: ReactNode;
};

export const PartnerCards = memo(function PartnerCards({
  title,
  children,
  openByDefault = false,
}: PartnerCardsProps) {
  return (
    <Collapsable openByDefault={openByDefault} variant="primary" title={<Title>{title}</Title>}>
      <Content>{children}</Content>
    </Collapsable>
  );
});

const contentStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const Content = memo(function Content(props: { children: ReactNode }) {
  return <div className={contentStyles} {...props} />;
});

const titleStyles = css({
  color: 'text.light',
});

const Title = memo(function Title(props: { children: ReactNode }) {
  return <h2 className={titleStyles} {...props} />;
});
