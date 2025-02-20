import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectBoostCampaignById, selectBoostPartnerById } from '../../../data/selectors/boosts';
import { makeStyles, type Theme } from '@material-ui/core';
import type { PromoSocials } from '../../../data/apis/promos/types';
import type { TokenEntity } from '../../../data/entities/token';
import { useTranslation } from 'react-i18next';
import { Socials } from './Socials';
import { CardContent } from '../Card';
import { RewardTokenDetails } from '../RewardTokenDetails';
import { Partner } from './Partner';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    padding: '24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.contentDark,
  },
  boostedBy: {
    ...theme.typography['h2'],
    margin: 0,
    color: theme.palette.background.vaults.boost,
    flexGrow: 1,
    '& span': {
      color: theme.palette.text.light,
    },
  },
  campaignTitle: {
    ...theme.typography['h3'],
  },
  campaignText: {
    color: theme.palette.text.middle,
  },
  partners: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  content: {
    rowGap: '16px',
  },
}));

export type CampaignPromoCardProps = Omit<
  PromoCardProps,
  'title' | 'text' | 'website' | 'websiteLabel' | 'socials'
> & {
  campaignId: string;
};

export const CampaignPromoCard = memo(function CampaignPromoCard({
  campaignId,
  ...rest
}: CampaignPromoCardProps) {
  const { t } = useTranslation();
  const campaign = useAppSelector(state => selectBoostCampaignById(state, campaignId));

  return (
    <PromoCard
      title={campaign.title}
      text={campaign.description}
      website={campaign.learn}
      websiteLabel={t('Boost-learn-more')}
      socials={campaign.social}
      {...rest}
    />
  );
});

export type PartnersPromoCardProps = Omit<
  PromoCardProps,
  'by' | 'text' | 'website' | 'websiteLabel' | 'socials' | 'partnerIds'
> & {
  partnerIds: string[];
};

export const PartnersPromoCard = memo(function PartnersPromoCard({
  partnerIds,
  ...rest
}: PartnersPromoCardProps) {
  const { t } = useTranslation();
  const [mainPartnerId, ...otherPartnerIds] = partnerIds;
  const mainPartner = useAppSelector(state => selectBoostPartnerById(state, mainPartnerId));

  return (
    <PromoCard
      by={mainPartner.title}
      text={mainPartner.text}
      website={mainPartner.website}
      websiteLabel={t('Boost-PartnerLink-website')}
      socials={mainPartner.social}
      partnerIds={otherPartnerIds}
      {...rest}
    />
  );
});

export type PromoCardProps = {
  by: string;
  title?: string;
  text?: string;
  website?: string;
  websiteLabel?: string;
  socials?: PromoSocials;
  partnerIds?: string[];
  tokens?: Array<Pick<TokenEntity, 'address' | 'chainId'>>;
};

export const PromoCard = memo<PromoCardProps>(function PromoCard({
  by,
  title,
  text,
  website,
  websiteLabel,
  socials,
  partnerIds,
  tokens,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.boostedBy}>
          {t('Vault-BoostedBy')}
          <span>{by}</span>
        </h2>
        <Socials website={website} websiteLabel={websiteLabel} socials={socials} />
      </div>
      <CardContent className={classes.content}>
        {title && <div className={classes.campaignTitle}>{title}</div>}
        {text && <div className={classes.campaignText}>{text}</div>}
        {partnerIds &&
          partnerIds.map(partnerId => <Partner key={partnerId} partnerId={partnerId} />)}
        {tokens &&
          tokens.map(rewardToken => (
            <RewardTokenDetails
              key={rewardToken.address}
              address={rewardToken.address}
              chainId={rewardToken.chainId}
            />
          ))}
      </CardContent>
    </div>
  );
});
