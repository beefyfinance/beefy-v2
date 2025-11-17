import { memo } from 'react';
import { Outlet } from 'react-router';
import { layoutRecipe } from './styles.ts';
import { Header } from './Header/Header.tsx';
import { Footer } from './Footer/Footer.tsx';
import { ScrollRestorer } from '../ScrollToTop/ScrollRestorer.tsx';
import { DefaultMeta } from '../Meta/DefaultMeta.tsx';
import { Stepper } from '../Stepper/Stepper.tsx';
import { AddTokenToWallet } from '../AddTokenToWallet/AddTokenToWallet.tsx';
import { AppVersionCheck } from '../AppVersionCheck/AppVersionCheck.tsx';
import { Tenderly } from '../Tenderly/Tenderly.tsx';
import { NavigationStatus } from './NavigationStatus.tsx';
import { WalletSelect } from '../Wallet/WalletSelect.tsx';

export const AppLayout = memo(() => {
  const classes = layoutRecipe();

  return (
    <>
      <div className={classes.wrapper}>
        <div className={classes.top}>
          <NavigationStatus />
          <Header />
        </div>
        <div className={classes.middle}>
          <Outlet />
        </div>
        <div className={classes.bottom}>
          <Footer />
        </div>
      </div>
      <ScrollRestorer />
      <DefaultMeta />
      <Stepper />
      <WalletSelect />
      <AddTokenToWallet />
      <AppVersionCheck />
      {import.meta.env.DEV && <Tenderly />}
    </>
  );
});
