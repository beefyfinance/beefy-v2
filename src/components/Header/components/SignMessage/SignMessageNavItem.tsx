import { memo } from 'react';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { RightArrow } from '../NavItem/RightArrow.tsx';
import { NavLink } from '../NavItem/NavLink.tsx';

export const SignMessageNavItem = memo<NavItemProps>(function SignMessageNavItem({
  title,
  Icon,
  Badge,
  onClick,
  mobile = false,
  dropdownItem = false,
}) {
  return (
    <NavLink to="/sign-message" onClick={onClick} mobile={mobile} dropdownItem={dropdownItem}>
      <NavItemInner
        title={title}
        Icon={Icon}
        Badge={Badge}
        Arrow={mobile ? RightArrow : undefined}
      />
    </NavLink>
  );
});
