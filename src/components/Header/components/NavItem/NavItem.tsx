import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { styles } from './styles';
import { ArrowForwardIosRounded as RightArrow } from '@material-ui/icons';
import { NavItemProps } from '../DropNavItem/types';

const useStyles = makeStyles(styles);

type AutoNavLinkProps = {
  onClick?: NavLinkProps['onClick'];
  activeClassName: NavLinkProps['activeClassName'];
  exact: NavLinkProps['exact'];
  to: NavLinkProps['to'];
  children: NavLinkProps['children'];
  className: HTMLAnchorElement['className'];
};
const AutoNavLink = memo<AutoNavLinkProps>(function ({
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

export const NavItem = memo<NavItemProps>(function ({ url, title, Icon, Badge, onClick }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AutoNavLink
      activeClassName={classes.active}
      exact={true}
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

export const NavItemMobile = memo<NavItemPropsMobile>(function ({
  url,
  title,
  Icon,
  className,
  onClick,
  Badge,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AutoNavLink
      onClick={onClick}
      activeClassName={classes.active}
      exact={true}
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
