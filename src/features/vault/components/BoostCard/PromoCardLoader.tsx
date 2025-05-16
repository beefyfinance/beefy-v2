import { type ComponentType, lazy, memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectActivePromoForVault } from '../../../data/selectors/promos.ts';
import type { PromoCardLoaderProps, PromoCardProps, PromoCardTypeToComponent } from './types.ts';

const typeToComponent: PromoCardTypeToComponent = {
  boost: lazy(() => import('./BoostCard.tsx')),
  pool: lazy(() => import('./PoolCard.tsx')),
  offchain: lazy(() => import('./OffChainCard.tsx')),
  airdrop: lazy(() => import('./AirdropCard.tsx')),
};

export const PromoCardLoader = memo(function PromoCardLoader({ vaultId }: PromoCardLoaderProps) {
  const promo = useAppSelector(state => selectActivePromoForVault(state, vaultId));
  if (!promo) return null;

  const Component = typeToComponent[promo.type] as ComponentType<PromoCardProps>;
  return <Component vaultId={vaultId} promo={promo} />;
});
