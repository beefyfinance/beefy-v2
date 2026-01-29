import { memo } from 'react';
import { Container } from '../Container/Container.tsx';
import { PageLayout } from '../PageLayout/PageLayout.tsx';
import { styled } from '@repo/styles/jsx';
import { css } from '@repo/styles/css';

interface PageWithIntroAndContentLayoutProps {
  introduction: React.ReactNode;
  content: React.ReactNode;
}

export const PageWithIntroAndContentLayout = memo<PageWithIntroAndContentLayoutProps>(
  function PageWithIntroAndContentLayout({ introduction, content }) {
    return (
      <PageLayout
        contentAlignedCenter={true}
        content={
          <Container
            maxWidth="lg"
            css={css.raw({
              paddingTop: '32',
              paddingBottom: '32',
            })}
          >
            <Inner>
              <Intro>{introduction}</Intro>
              {content}
            </Inner>
          </Container>
        }
      />
    );
  }
);

const Inner = styled('div', {
  base: {
    margin: '0 auto',
    width: '1036px',
    maxWidth: '100%',
    display: 'grid',
    columnGap: '132px',
    rowGap: '32px',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto',
    md: {
      gridTemplateColumns: 'minmax(0, 1fr) 440px',
    },
  },
});

const Intro = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    lg: {
      paddingLeft: '12px',
    },
  },
});
