import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { PromoSocials } from '../../../data/apis/promos/types.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import { selectBoostCampaignById, selectBoostPartnerById } from '../../../data/selectors/boosts.ts';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { RewardTokenDetails } from '../RewardTokenDetails/RewardTokenDetails.tsx';
import { Partner } from './Partner.tsx';
import { Socials } from './Socials.tsx';
import { MarkdownText } from '../../../components/Markdown/MarkdownText.tsx';

const campaignTextClass = css({
  color: 'text.middle',
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
  const { t } = useTranslation();

  return (
    <div>
      <CardHeader>
        <BoostedBy>
          {t('Vault-BoostedBy')}
          <span>{by}</span>
        </BoostedBy>
        <Socials website={website} websiteLabel={websiteLabel} socials={socials} />
      </CardHeader>
      <Content>
        {title && <CampaignTitle>{title}</CampaignTitle>}
        {text && <MarkdownText className={campaignTextClass} text={text} />}
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
      </Content>
    </div>
  );
});

const BoostedBy = styled('h2', {
  base: {
    textStyle: 'h2',
    margin: '0',
    color: 'text.boosted',
    flexGrow: '1',
    '& span': {
      color: 'text.light',
    },
  },
});

const CampaignTitle = styled('div', {
  base: {
    textStyle: 'h3',
  },
});

const Content = styled(CardContent, {
  base: {
    rowGap: '16px',
    backgroundColor: 'background.content',
  },
});
