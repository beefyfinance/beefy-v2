import { NavLink as RouterNavLink, type NavLinkProps as RouterNavLinkProps } from 'react-router';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { cva } from '@repo/styles/css';
import type { ReactNode } from 'react';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import { ExternalLink } from '../../../Links/ExternalLink.tsx';

const navItemStyles = {
  base: {
    display: 'flex',
    textDecoration: 'none',
    color: 'text.dark',
    columnGap: '4px',
    outline: 'none',
    padding: '2px',
  },
  variants: {
    mobile: {
      true: {
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
      },
    },
    dropdownItem: {
      true: {
        padding: '8px 12px',
        _hover: {
          backgroundColor: 'background.button',
        },
      },
    },
  },
} as const;

const navItemRecipe = cva(navItemStyles);

const navLinkRecipe = cva({
  ...navItemStyles,
  base: {
    ...navItemStyles.base,
    _hover: {
      color: 'text.light',
    },
    _focus: {
      color: 'text.light',
    },
    _active: {
      color: 'text.light',
    },
  },
});

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
