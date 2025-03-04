import type { VaultCowcentratedLike, VaultEntity } from '../../../features/data/entities/vault.ts';
import type { BannerProps } from '../Banner/types.ts';

export type ClmBannerProps = Omit<BannerProps, 'variant' | 'icon'>;

export type UnstakedClmBannerVaultProps = {
  vaultId: VaultEntity['id'];
  fromVault?: boolean;
};

export type UnstakedClmBannerVaultImplProps = {
  vault: VaultCowcentratedLike;
  fromVault: boolean;
};

export interface UnstakedClmBannerDashboardProps {
  address: string;
}
