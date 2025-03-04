import {
  NavLink as RouterNavLink,
  type NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';

type NavLinkProps = {
  onClick?: RouterNavLinkProps['onClick'];
  exact: RouterNavLinkProps['exact'];
  to: RouterNavLinkProps['to'];
  children: RouterNavLinkProps['children'];
  mobile?: boolean;
};

export const NavLink = memo<NavLinkProps>(function NavLink({
  to,
  children,
  onClick,
  mobile = false,
  ...rest
}) {
  const isExternal = typeof to === 'string' && to[0] !== '/';

  if (isExternal) {
    return <ExternalNavLink href={to} children={children} onClick={onClick} mobile={mobile} />;
  }

  return (
    <InternalNavLink to={to} children={children} onClick={onClick} mobile={mobile} {...rest} />
  );
});

const navItemRecipe = {
  base: {
    display: 'flex',
    textDecoration: 'none',
    color: 'text.dark',
    columnGap: '8px',
    outline: 'none',
  },
  variants: {
    mobile: {
      true: {
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
      },
    },
  },
} as const;

const navLinkRecipe = {
  ...navItemRecipe,
  base: {
    ...navItemRecipe.base,
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
} as const;

export const NavItem = styled('div', navItemRecipe);

const ExternalNavLink = styled('a', navLinkRecipe, {
  defaultProps: {
    target: '_blank',
    rel: 'noopener',
  },
});

const InternalNavLink = styled(RouterNavLink, navLinkRecipe);

export const DropdownNavButton = styled(DropdownTrigger.button, navLinkRecipe, {
  defaultProps: {
    type: 'button',
  },
});
