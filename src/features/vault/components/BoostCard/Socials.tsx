import { memo } from 'react';
import { LinkIcon } from '../../../../components/LinkIcon/LinkIcon.tsx';
import Twitter from '../../../../images/icons/twitter.svg';
import Telegram from '../../../../images/icons/telegram.svg';
import Discord from '../../../../images/icons/discord.svg';
import type { PromoSocials } from '../../../data/apis/promos/types.ts';
import { LinkButton } from '../../../../components/LinkButton/LinkButton.tsx';
import Link from '../../../../images/icons/mui/Link.svg?react';
import { css } from '@repo/styles/css';

const socialsCss = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
  rowGap: '8px',
  columnGap: '8px',
});

export type SocialsProps = {
  website?: string;
  websiteLabel?: string;
  socials?: PromoSocials;
};

export const Socials = memo(function Socials({ website, websiteLabel, socials }: SocialsProps) {
  if (!website && !socials?.twitter && !socials?.telegram && !socials?.discord) {
    return null;
  }

  return (
    <div className={socialsCss}>
      {website &&
        (websiteLabel ?
          <LinkButton href={website} text={websiteLabel} />
        : <LinkIcon alt="website" href={website} logo={Link} />)}
      {socials?.twitter && <LinkIcon alt="twitter" logo={Twitter} href={socials.twitter} />}
      {socials?.telegram && <LinkIcon alt="telegram" logo={Telegram} href={socials.telegram} />}
      {socials?.discord && <LinkIcon alt="discord" logo={Discord} href={socials.discord} />}
    </div>
  );
});
