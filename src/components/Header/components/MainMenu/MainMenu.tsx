import { NavLinkItem } from '../NavItem/NavLinkItem.tsx';
import { DropNavItem } from '../DropNavItem/DropNavItem.tsx';
import { DaoNavItems, ResourcesNavItems } from '../../list.ts';
import { UnreadArticleDot, UnreadProposalDot } from '../Badges/UnreadDots.tsx';
import { memo } from 'react';
import VaultsIcon from '../../../../images/icons/navigation/vault.svg?react';
import DashboardIcon from '../../../../images/icons/navigation/dashboard.svg?react';
import DaoIcon from '../../../../images/icons/navigation/dao.svg?react';
import ResourcesIcon from '../../../../images/icons/navigation/resources.svg?react';

export const MainMenu = memo(function MainMenu() {
  return (
    <>
      <NavLinkItem title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
      <NavLinkItem end={false} title={'Header-Dashboard'} url="/dashboard" Icon={DashboardIcon} />
      <DropNavItem
        title={'Header-Dao'}
        Icon={DaoIcon}
        items={DaoNavItems}
        Badge={UnreadProposalDot}
      />
      <DropNavItem
        title={'Header-Resources'}
        Icon={ResourcesIcon}
        items={ResourcesNavItems}
        Badge={UnreadArticleDot}
      />
    </>
  );
});
