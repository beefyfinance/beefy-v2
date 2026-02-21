import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode } from 'react';

export type PageLayoutProps = {
  content: ReactNode;
  header?: ReactNode;
};

export const PageLayout = memo(function PageLayout({ header, content }: PageLayoutProps) {
  return (
    <Container>
      {header && header}
      <Content>{content}</Content>
    </Container>
  );
});

const Container = styled('div', {
  base: {
    flex: '1 1 auto',
    backgroundColor: 'background.header',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
});

//TODO: add variants to differents page layouts
const Content = styled('div', {
  base: {
    backgroundColor: 'background.body',
    borderRadius: '20px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    sm: {
      borderRadius: '24px',
    },
  },
});
