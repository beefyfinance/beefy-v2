import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavItem } from '../NavItem/NavLink.tsx';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { useSignMessageModal } from './useSignMessageModal.ts';

export const SignMessageNavItem = memo<NavItemProps>(function SignMessageNavItem({
  title,
  Icon,
  Badge,
  onClick,
  mobile = false,
  dropdownItem = false,
}) {
  const { openModal } = useSignMessageModal();

  const handleOpen = useCallback(() => {
    onClick?.();
    openModal();
  }, [onClick, openModal]);

  return (
    <NavItem mobile={mobile} dropdownItem={dropdownItem} onClick={handleOpen}>
      <NavItemInner title={title} Icon={Icon} Badge={Badge} />
    </NavItem>
  );
});
