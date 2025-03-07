import type { VaultEntity } from '../../../data/entities/vault.ts';
import type { AllValuesAsString } from '../../../data/utils/types-utils.ts';
import type { Placement } from '@floating-ui/react';

export type ShareButtonProps = {
  vaultId: VaultEntity['id'];
  placement?: Placement;
  mobileAlternative?: boolean;
  hideText?: boolean;
};

export type CommonVaultDetails = {
  vaultName: string;
  vaultApy: string;
  vaultUrl: string;
  chainName: string;
  chainTag: string;
  beefyHandle: string;
};
export type CommonType = 'normal' | 'clm' | 'clm-pool';
export type CommonExtraDetails = {
  kind: CommonType;
};
export type NormalVaultDetails = CommonVaultDetails & CommonExtraDetails;

export type BoostedVaultExtraDetails = {
  kind: 'boosted';
  vaultApy: string;
  boostToken: string;
  boostTokenTag: string;
  partnerName: string;
  partnerHandle?: string | undefined;
  partnerTag: string;
  partnerHandleOrTag: string;
};
export type BoostedVaultDetails = CommonVaultDetails & BoostedVaultExtraDetails;

export type GovVaultExtraDetails = {
  kind: 'gov';
  earnToken: string;
  earnTokenTag: string;
};
export type GovVaultDetails = CommonVaultDetails & GovVaultExtraDetails;

export type VaultDetails = NormalVaultDetails | BoostedVaultDetails | GovVaultDetails;

export type ShareServiceItemProps = {
  details: AllValuesAsString<VaultDetails>;
};

export type ShareItemProps = {
  text: string;
  icon: string;
  onClick: () => void;
};
