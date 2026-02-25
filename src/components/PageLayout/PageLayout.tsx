import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode } from 'react';

export type PageLayoutProps = {
  content: ReactNode;
  header?: ReactNode;
  contentAlignedCenter?: boolean;
};

export const PageLayout = memo(function PageLayout({
  header,
  content,
  contentAlignedCenter = false,
}: PageLayoutProps) {
  return (
    <Container>
      {header && header}
      <Content contentAlignedCenter={contentAlignedCenter}>{content}</Content>
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
  variants: {
    contentAlignedCenter: {
      true: {
        justifyContent: 'center',
      },
    },
  },
});
