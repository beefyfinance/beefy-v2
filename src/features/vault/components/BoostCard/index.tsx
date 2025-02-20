import { type ComponentType, lazy, memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectActivePromoForVault } from '../../../data/selectors/promos';
import type { PromoCardLoaderProps, PromoCardProps, PromoCardTypeToComponent } from './types';

const typeToComponent: PromoCardTypeToComponent = {
  boost: lazy(() => import('./BoostCard')),
  pool: lazy(() => import('./PoolCard')),
  offchain: lazy(() => import('./OffChainCard')),
  airdrop: lazy(() => import('./AirdropCard')),
};

export const PromoCardLoader = memo(function PromoCardLoader({ vaultId }: PromoCardLoaderProps) {
  const promo = useAppSelector(state => selectActivePromoForVault(state, vaultId));
  if (!promo) return null;

  const Component: ComponentType<PromoCardProps> = typeToComponent[promo.type];
  return <Component vaultId={vaultId} promo={promo} />;
});
