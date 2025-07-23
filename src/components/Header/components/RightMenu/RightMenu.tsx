import { memo } from 'react';
import BuyCryptoIcon from '../../../../images/icons/navigation/buy-crypto.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { BifiPricesDesktop } from '../Prices/Prices.tsx';

export const RightMenu = memo(function RightMenu() {
  return (
    <>
      <NavLinkItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
      <BifiPricesDesktop />
    </>
  );
});
