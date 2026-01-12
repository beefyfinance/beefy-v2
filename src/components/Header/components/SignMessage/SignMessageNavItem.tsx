import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavItemInner } from '../NavItem/NavItemInner.tsx';
import { useSignMessageModal } from './useSignMessageModal.ts';
import { styled } from '@repo/styles/jsx';
import { navLinkRecipe } from '../NavItem/styles.tsx';
import { RightArrow } from '../NavItem/RightArrow.tsx';

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
    <NavButton mobile={mobile} dropdownItem={dropdownItem} onClick={handleOpen}>
      <NavItemInner
        title={title}
        Icon={Icon}
        Badge={Badge}
        Arrow={mobile ? RightArrow : undefined}
      />
    </NavButton>
  );
});

const NavButton = styled('button', navLinkRecipe);
