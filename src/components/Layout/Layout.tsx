import React, { memo, PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { ReactComponent as IconGithub } from '../../images/socials/github.svg';
import { ReactComponent as IconTelegram } from '../../images/socials/telegram.svg';
import { ReactComponent as IconDiscord } from '../../images/socials/discord.svg';
import { ReactComponent as IconTwitter } from '../../images/socials/twitter.svg';
import { ReactComponent as IconReddit } from '../../images/socials/reddit.svg';
import clsx from 'clsx';
import { useLocation } from 'react-router';

const useStyles = makeStyles(styles);

export type LayoutProps = {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export const Layout = memo<LayoutProps>(function Layout({ header, footer, children }) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.top}>{header}</div>
      <div className={classes.middle}>{children}</div>
      <div className={classes.bottom}>{footer}</div>
    </div>
  );
});
