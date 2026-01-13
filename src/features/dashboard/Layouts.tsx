import { memo } from 'react';
import { PageLayout, type PageLayoutProps } from '../../components/PageLayout/PageLayout.tsx';
import { styled } from '@repo/styles/jsx';

export const DashboardLayout = memo(function DashboardLayout({
  content,
  header,
}: Pick<PageLayoutProps, 'content' | 'header'>) {
  return <PageLayout content={<Content w100={true}>{content}</Content>} header={header} />;
});

export const NoticeLayout = memo(function DashboardLayout({
  content,
}: Pick<PageLayoutProps, 'content'>) {
  return (
    <PageLayout contentAlignedCenter={true} content={<Content w100={true}>{content}</Content>} />
  );
});

const Content = styled('div', {
  base: {
    paddingBlock: '0px 20px',
  },
  variants: {
    w100: {
      true: {
        width: '100%',
      },
    },
  },
});
