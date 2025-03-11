import { memo } from 'react';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavLink } from './NavLink.tsx';
import { NavItemInner } from './NavItemInner.tsx';
import { RightArrow } from './RightArrow.tsx';

export const NavLinkItem = memo<NavItemProps>(function NavLinkItem({
  url,
  title,
  Icon,
  Badge,
  onClick,
  end = true,
  mobile = false,
}) {
  return (
    <NavLink end={end} key={url} to={url} onClick={onClick} mobile={mobile}>
      <NavItemInner
        title={title}
        Icon={Icon}
        Badge={Badge}
        Arrow={mobile ? RightArrow : undefined}
      />
    </NavLink>
  );
});
