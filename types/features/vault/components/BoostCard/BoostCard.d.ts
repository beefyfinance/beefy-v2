import type { BoostPromoEntity } from '../../../data/entities/promo';
import type { PromoCardProps } from './types';
declare const BoostCard: (({ promo }: PromoCardProps<BoostPromoEntity>) => import("react/jsx-runtime").JSX.Element | undefined) & {
    displayName?: string;
};
export default BoostCard;
