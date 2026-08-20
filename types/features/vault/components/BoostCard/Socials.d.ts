import type { PromoSocials } from '../../../data/apis/promos/types';
export type SocialsProps = {
    website?: string;
    websiteLabel?: string;
    socials?: PromoSocials;
};
export declare const Socials: (({ website, websiteLabel, socials }: SocialsProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
