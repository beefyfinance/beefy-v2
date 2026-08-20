import type { PromoSocials } from '../../../data/apis/promos/types';
import type { TokenEntity } from '../../../data/entities/token';
export type CampaignPromoCardProps = Omit<PromoCardProps, 'title' | 'text' | 'website' | 'websiteLabel' | 'socials'> & {
    campaignId: string;
};
export declare const CampaignPromoCard: (({ campaignId, ...rest }: CampaignPromoCardProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type PartnersPromoCardProps = Omit<PromoCardProps, 'by' | 'text' | 'website' | 'websiteLabel' | 'socials' | 'partnerIds'> & {
    partnerIds: string[];
};
export declare const PartnersPromoCard: (({ partnerIds, ...rest }: PartnersPromoCardProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
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
export declare const PromoCard: import("react").NamedExoticComponent<PromoCardProps>;
