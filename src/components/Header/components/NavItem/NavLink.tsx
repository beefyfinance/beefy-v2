import { NavLink as RouterNavLink, type NavLinkProps as RouterNavLinkProps } from 'react-router';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import { cva } from '@repo/styles/css';
import type { ReactNode } from 'react';

const navItemStyles = {
  base: {
    display: 'flex',
    textDecoration: 'none',
    color: 'text.dark',
    columnGap: '4px',
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

type NavLinkProps = {
  onClick?: RouterNavLinkProps['onClick'];

  to: RouterNavLinkProps['to'];
  children: ReactNode;
  mobile?: boolean;
  end?: boolean;
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
