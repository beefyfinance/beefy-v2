import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { Filters } from './components/Filters';
import { Portfolio } from './components/Portfolio';
import { Loading } from './components/Loading';
import { selectIsVaultListAvailable } from '../data/selectors/data-loader';
import { styles } from './styles';
import { Vaults } from './components/Vaults';
import { useAppSelector } from '../../store';
import { Banners } from './components/Banners';
import { HomeMeta } from '../../components/Meta/HomeMeta';
import { Container } from '../../components/Container/Container';

const useStyles = makeStyles(styles);

export const Home = memo(function Home() {
  const classes = useStyles();
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
      <div className={classes.top}>
        <Banners />
        <Portfolio />
      </div>
      <Container maxWidth="lg" className={classes.vaultContainer}>
        <Filters />
        <Vaults />
      </Container>
    </>
  );
});
