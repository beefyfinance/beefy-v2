import { Badge, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { styles } from './styles';
import { ArrowForwardIosRounded as RightArrow } from '@material-ui/icons';

interface NavItemProps {
  url: string;
  title: string;
  Icon: React.FC;
  withBadge?: boolean;
}

const useStyles = makeStyles(styles);

type AutoNavLinkProps = {
  onClick?: NavLinkProps['onClick'];
  activeClassName: NavLinkProps['activeClassName'];
  exact: NavLinkProps['exact'];
  to: NavLinkProps['to'];
  children: NavLinkProps['children'];
  className: HTMLAnchorElement['className'];
};
const AutoNavLink = memo<AutoNavLinkProps>(function ({ to, className, children, ...rest }) {
  const isExternal = typeof to === 'string' && to[0] !== '/';

  if (isExternal) {
    return <a className={className} href={to} target="_blank" rel="noopener" children={children} />;
  }

  return <NavLink className={className} to={to} children={children} {...rest} />;
});

export const NavItem = memo<NavItemProps>(function ({ url, title, Icon, withBadge = false }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AutoNavLink
      activeClassName={classes.active}
      exact={true}
      className={classes.navLink}
      key={url}
      to={url}
    >
      {withBadge ? (
        <Badge badgeContent="New" color="primary">
          <Icon />
          {t(title)}
        </Badge>
      ) : (
        <>
          <Icon />
          {t(title)}
        </>
      )}
    </AutoNavLink>
  );
});

type NavItemPropsMobile = NavItemProps & { className?: string; onClick: () => void };

export const NavItemMobile = memo<NavItemPropsMobile>(function ({
  url,
  title,
  Icon,
  className,
  onClick,
  withBadge = false,
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
        {withBadge ? (
          <Badge badgeContent="New" color="primary">
            <Icon />
            {t(title)}
          </Badge>
        ) : (
          <>
            <Icon />
            {t(title)}
          </>
        )}
      </div>
      <RightArrow className={classes.arrow} />
    </AutoNavLink>
  );
});
