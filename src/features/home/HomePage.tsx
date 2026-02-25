import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { Container } from '../../components/Container/Container.tsx';
import { HomeMeta } from '../../components/Meta/HomeMeta.tsx';
import { useAppSelector } from '../data/store/hooks.ts';
import { selectIsVaultListAvailable } from '../data/selectors/vaults-list.ts';
import { Banners } from './components/Banners/Banners.tsx';
import { Filters } from './components/Filters/Filters.tsx';
import { Loading } from './components/Loading/Loading.tsx';
import { HomeHeader } from './components/HomeHeader/HomeHeader.tsx';
import { Vaults } from './components/Vaults/Vaults.tsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';

const HomePage = memo(function HomePage() {
  const isVaultListAvailable = useAppSelector(selectIsVaultListAvailable);

  if (!isVaultListAvailable) {
    return (
      <PageLayout
        content={
          <>
            <HomeMeta />
            <Loading />
          </>
        }
      />
    );
  }

  return (
    <>
      <HomeMeta />
      <PageLayout
        header={
          <>
            <Container maxWidth="lg">
              <Banners />
            </Container>
            <HeaderContainer maxWidth="lg">
              <HomeHeader />
            </HeaderContainer>
          </>
        }
        content={
          <Content>
            <Container maxWidth="lg">
              <Filters />
            </Container>
            <Vaults />
          </Content>
        }
      />
    </>
  );
});

const HeaderContainer = styled(Container, {
  base: {
    // base padding is 12px
    sm: {
      //  need to ad 12px for desktop
      paddingInline: `24px`,
    },
    lg: {
      //  need to ad 14px for desktop
      paddingInline: `26px`,
    },
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 24px',
    sm: {
      paddingBlock: '14px 28px',
      borderRadius: '24px',
    },
    lg: {
      paddingBlock: '14px 48px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default HomePage;
