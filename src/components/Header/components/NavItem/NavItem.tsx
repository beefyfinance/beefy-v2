import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { styles } from './styles';

interface NavItemProps {
  url: string;
  title: string;
  Icon: React.FC;
}

const useStyles = makeStyles(styles);

export const NavItem = memo<NavItemProps>(function ({ url, title, Icon }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <NavLink
      activeClassName={classes.active}
      exact={true}
      className={classes.navLink}
      key={url}
      to={url[0] === '/' ? url : { pathname: url }}
      target={url[0] === '/' ? undefined : '_blank'}
    >
      <Icon />
      {t(title)}
    </NavLink>
  );
});

type NavItemPropsMobile = NavItemProps & { className?: string };

export const NavItemMobile = memo<NavItemPropsMobile>(function ({ url, title, Icon, className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <NavLink
      activeClassName={classes.active}
      exact={true}
      className={clsx(classes.navLink, classes.itemMobile, className)}
      key={url}
      to={url[0] === '/' ? url : { pathname: url }}
      target={url[0] === '/' ? undefined : '_blank'}
    >
      <div className={classes.flex}>
        <Icon />
        {t(title)}
      </div>
      {'>'}
    </NavLink>
  );
});
