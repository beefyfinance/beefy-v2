import { makeStyles, type Theme } from '@material-ui/core';
import { memo } from 'react';
import { LinkIcon } from '../../../../components/LinkIcon';
import { Link } from '@material-ui/icons';
import Twitter from '../../../../images/icons/twitter.svg';
import Telegram from '../../../../images/icons/telegram.svg';
import Discord from '../../../../images/icons/discord.svg';
import type { PromoSocials } from '../../../data/apis/promos/types';
import { LinkButton } from '../../../../components/LinkButton';

const useStyles = makeStyles((theme: Theme) => ({
  socials: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    rowGap: '8px',
    columnGap: '8px',
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '0',
    },
  },
}));

export type SocialsProps = {
  website?: string;
  websiteLabel?: string;
  socials?: PromoSocials;
};

export const Socials = memo(function Socials({ website, websiteLabel, socials }: SocialsProps) {
  const classes = useStyles();

  if (!website && !socials?.twitter && !socials?.telegram && !socials?.discord) {
    return null;
  }

  return (
    <div className={classes.socials}>
      {website &&
        (websiteLabel ? (
          <LinkButton href={website} text={websiteLabel} />
        ) : (
          <LinkIcon alt="website" href={website} logo={Link} />
        ))}
      {socials?.twitter && <LinkIcon alt="twitter" logo={Twitter} href={socials.twitter} />}
      {socials?.telegram && <LinkIcon alt="telegram" logo={Telegram} href={socials.telegram} />}
      {socials?.discord && <LinkIcon alt="discord" logo={Discord} href={socials.discord} />}
    </div>
  );
});
