import { memo } from 'react';
import { Filters } from './components/Filters/Filters.tsx';
import { Portfolio } from './components/Portfolio/Portfolio.tsx';
import { Loading } from './components/Loading/Loading.tsx';
import { selectIsVaultListAvailable } from '../data/selectors/data-loader.ts';
import { Vaults } from './components/Vaults/Vaults.tsx';
import { useAppSelector } from '../../store.ts';
import { Banners } from './components/Banners/Banners.tsx';
import { HomeMeta } from '../../components/Meta/HomeMeta.tsx';
import { Container } from '../../components/Container/Container.tsx';
import { styled } from '@repo/styles/jsx';

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
          <Portfolio />
        </Container>
      </Header>
      <Content>
        <Container maxWidth="lg">
          <Filters />
          <Vaults />
        </Container>
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
