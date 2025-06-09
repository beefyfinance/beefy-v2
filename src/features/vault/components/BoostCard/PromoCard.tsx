import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { PromoSocials } from '../../../data/apis/promos/types.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import { selectBoostCampaignById, selectBoostPartnerById } from '../../../data/selectors/boosts.ts';
import { CardContent } from '../Card/CardContent.tsx';
import { RewardTokenDetails } from '../RewardTokenDetails/RewardTokenDetails.tsx';
import { Partner } from './Partner.tsx';
import { Socials } from './Socials.tsx';
import { MarkdownText } from '../../../components/Markdown/MarkdownText.tsx';

const useStyles = legacyMakeStyles({
  header: css.raw({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: 'background.content.dark',
    padding: '16px',
    sm: {
      padding: '24px',
    },
  }),
  boostedBy: css.raw({
    textStyle: 'h2',
    margin: '0',
    color: 'text.boosted',
    flexGrow: '1',
    '& span': {
      color: 'text.light',
    },
  }),
  campaignTitle: css.raw({
    textStyle: 'h3',
  }),
  campaignText: css.raw({
    color: 'text.middle',
  }),
  partners: css.raw({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  }),
  content: css.raw({
    rowGap: '16px',
    backgroundColor: 'background.content',
  }),
});

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
        {text && <MarkdownText className={classes.campaignText} text={text} />}
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
