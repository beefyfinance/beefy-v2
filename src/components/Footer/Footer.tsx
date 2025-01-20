import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { ReactComponent as IconGithub } from '../../images/socials/github.svg';
import { ReactComponent as IconTelegram } from '../../images/socials/telegram.svg';
import { ReactComponent as IconDiscord } from '../../images/socials/discord.svg';
import { ReactComponent as IconTwitter } from '../../images/socials/twitter.svg';
import { ReactComponent as IconReddit } from '../../images/socials/reddit.svg';
import { ReactComponent as IconDebank } from '../../images/socials/debank.svg';

// Re-using header translations, allowing overwrite with footer specific ones
const navLinks = [
  {
    title: ['Footer-Proposals', 'Header-Proposals'],
    path: 'https://vote.beefy.finance',
  },
  {
    title: ['Footer-News', 'Header-News'],
    path: 'https://beefy.com/articles/',
  },
  {
    title: ['Footer-Docs', 'Header-Docs'],
    path: 'https://docs.beefy.finance',
  },
  {
    title: 'Footer-Audit',
    path: 'https://github.com/beefyfinance/beefy-audits',
  },
  {
    title: 'Footer-MediaKit',
    path: 'https://beefy.com/media-kit/',
  },
  {
    title: 'Footer-Partners',
    path: 'https://beefy.com/partners/',
  },
];

const socialLinks = [
  {
    title: 'GitHub',
    path: 'https://github.com/beefyfinance',
    Icon: IconGithub,
  },
  {
    title: 'Telegram',
    path: 'https://t.me/beefyfinance',
    Icon: IconTelegram,
  },
  {
    title: 'Discord',
    path: 'https://beefy.finance/discord',
    Icon: IconDiscord,
  },
  {
    title: 'Twitter',
    path: 'https://x.com/beefyfinance',
    Icon: IconTwitter,
  },
  {
    title: 'Reddit',
    path: 'https://www.reddit.com/r/Beefy/',
    Icon: IconReddit,
  },
  {
    title: 'Debank',
    path: 'https://debank.com/official/Beefy',
    Icon: IconDebank,
  },
];

const useStyles = makeStyles(styles);

export const Footer = memo(function Footer() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.footer}>
      <ul className={classes.nav}>
        {navLinks.map(({ title, path }) => (
          <li key={path} className={classes.navItem}>
            <a href={path} target="_blank" rel="noopener" className={classes.navLink}>
              {t(title)}
            </a>
          </li>
        ))}
      </ul>
      <ul className={classes.nav}>
        {socialLinks.map(({ title, path, Icon }) => (
          <li key={path} className={classes.navItem}>
            <a
              href={path}
              target="_blank"
              rel="noopener"
              className={classes.navLink}
              title={t(title)}
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
