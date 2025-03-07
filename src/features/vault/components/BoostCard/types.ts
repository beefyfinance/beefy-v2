import type { VaultEntity } from '../../../data/entities/vault.ts';
import type { PromoEntity } from '../../../data/entities/promo.ts';
import type { ComponentType } from 'react';

export type PromoCardLoaderProps = {
  vaultId: VaultEntity['id'];
};

export type PromoCardProps<T extends PromoEntity = PromoEntity> = {
  vaultId: VaultEntity['id'];
  promo: T;
};

export type PromoCardTypeToComponent = {
  [K in PromoEntity['type']]: ComponentType<PromoCardProps<Extract<PromoEntity, { type: K }>>>;
};
