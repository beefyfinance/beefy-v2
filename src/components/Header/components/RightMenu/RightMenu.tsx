import { memo } from 'react';
import BridgeIcon from '../../../../images/icons/navigation/bridge.svg?react';
import BuyCryptoIcon from '../../../../images/icons/navigation/buy-crypto.svg?react';
import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { Prices } from '../Prices/Prices.tsx';

export const RightMenu = memo(function RightMenu() {
  return (
    <>
      <NavLinkItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
      <NavLinkItem title={'Header-BridgeBifi'} url="/bridge" Icon={BridgeIcon} />
      <Prices />
    </>
  );
});
