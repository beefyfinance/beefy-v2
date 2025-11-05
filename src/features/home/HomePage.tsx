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
      <Header>
        <Container maxWidth="lg">
          <Banners />
          <HomeHeader />
        </Container>
      </Header>
      <Content>
        <Container maxWidth="lg">
          <Filters />
        </Container>
        <Vaults />
      </Content>
    </>
  );
});

const Header = styled('div', {
  base: {
    backgroundColor: 'background.header',
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '20px',
    sm: {
      paddingBlock: '32px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default HomePage;
