import { NavLink as RouterNavLink, type NavLinkProps as RouterNavLinkProps } from 'react-router';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import type { ReactNode } from 'react';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import { ExternalLink } from '../../../Links/ExternalLink.tsx';
import { navItemRecipe, navLinkRecipe } from './styles.tsx';

export const NavItem = styled('div', navItemRecipe);

export const DropdownNavButton = styled(DropdownTrigger.button, navLinkRecipe, {
  defaultProps: {
    type: 'button',
  },
});

const ExternalNavLink = styled(ExternalLink, navLinkRecipe);

const InternalNavLink = styled(RouterNavLink, navLinkRecipe);

type NavLinkProps = {
  onClick?: RouterNavLinkProps['onClick'];
  to: RouterNavLinkProps['to'];
  children: ReactNode;
  mobile?: boolean;
  end?: boolean;
  dropdownItem?: boolean;
  externalLink?: boolean;
};

export const NavLink = memo<NavLinkProps>(function NavLink({
  to,
  children,
  onClick,
  mobile = false,
  dropdownItem = false,
  ...rest
}) {
  const isExternal = typeof to === 'string' && to[0] !== '/';

  if (isExternal) {
    return (
      <ExternalNavLink
        href={to}
        children={children}
        onClick={onClick}
        mobile={mobile}
        dropdownItem={dropdownItem}
      />
    );
  }

  return (
    <InternalNavLink
      to={to}
      children={children}
      onClick={onClick}
      mobile={mobile}
      dropdownItem={dropdownItem}
      {...rest}
    />
  );
});
