import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavLinkProps } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { styles } from './styles';
import { ArrowForwardIosRounded as RightArrow } from '@material-ui/icons';
import type { NavItemProps } from '../DropNavItem/types';

const useStyles = makeStyles(styles);

type AutoNavLinkProps = {
  onClick?: NavLinkProps['onClick'];
  activeClassName: NavLinkProps['activeClassName'];
  exact: NavLinkProps['exact'];
  to: NavLinkProps['to'];
  children: NavLinkProps['children'];
  className: HTMLAnchorElement['className'];
};
const AutoNavLink = memo<AutoNavLinkProps>(function AutoNavLink({
  to,
  className,
  children,
  onClick,
  ...rest
}) {
  const isExternal = typeof to === 'string' && to[0] !== '/';

  if (isExternal) {
    return (
      <a
        className={className}
        href={to}
        target="_blank"
        rel="noopener"
        children={children}
        onClick={onClick}
      />
    );
  }

  return <NavLink className={className} to={to} children={children} onClick={onClick} {...rest} />;
});

export const NavItem = memo<NavItemProps>(function NavItem({
  url,
  title,
  Icon,
  Badge,
  onClick,
  exact = true,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AutoNavLink
      activeClassName={classes.active}
      exact={exact}
      className={classes.navLink}
      key={url}
      to={url}
      onClick={onClick}
    >
      <Icon />
      <div className={clsx(classes.title, { [classes.titleWithBadge]: !!Badge })}>
        {t(title)}
        {Badge ? <Badge /> : null}
      </div>
    </AutoNavLink>
  );
});

type NavItemPropsMobile = NavItemProps;

export const NavItemMobile = memo<NavItemPropsMobile>(function NavItemMobile({
  url,
  title,
  Icon,
  className,
  onClick,
  Badge,
  exact = true,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AutoNavLink
      onClick={onClick}
      activeClassName={classes.active}
      exact={exact}
      className={clsx(classes.navLink, classes.itemMobile, className)}
      key={url}
      to={url}
    >
      <div className={classes.flex}>
        <Icon />
        <div className={clsx(classes.title, { [classes.titleWithBadge]: !!Badge })}>
          {t(title)}
          {Badge ? <Badge /> : null}
        </div>
      </div>
      <RightArrow className={classes.arrow} />
    </AutoNavLink>
  );
});
