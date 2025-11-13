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

const HomePage = memo(function HomePage() {
  const isVaultListAvailable = useAppSelector(selectIsVaultListAvailable);

  if (!isVaultListAvailable) {
    return (
      <>
        <HomeMeta />
        <Loading />
      </>
    );
  }

  return (
    <>
      <HomeMeta />
      <Background>
        <Container maxWidth="lg">
          <Banners />
        </Container>
        <HeaderContainer maxWidth="lg">
          <HomeHeader />
        </HeaderContainer>
        <Content>
          <Container maxWidth="lg">
            <Filters />
          </Container>
          <Vaults />
        </Content>
      </Background>
    </>
  );
});

const HeaderContainer = styled(Container, {
  base: {
    // base padding is 12px
    md: {
      //  need to ad 12px for desktop
      paddingInline: `${12 + 12}px`,
    },
    lg: {
      //  need to ad 14px for desktop
      paddingInline: `${12 + 14}px`,
    },
  },
});

const Background = styled('div', {
  base: {
    backgroundColor: 'background.header',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 20px',
    backgroundColor: 'background.body',
    borderRadius: '20px',
    flexGrow: 1,
    sm: {
      paddingBlock: '14px 32px',
      borderRadius: '24px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default HomePage;
