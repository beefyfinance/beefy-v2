import { VaultEntity } from '../../../data/entities/vault';
import { Placement } from '@floating-ui/react-dom';
import { AllValuesAsString } from '../../../data/utils/types-utils';

export type ShareButtonProps = {
  vaultId: VaultEntity['id'];
  placement?: Placement;
};

export type CommonVaultDetails = {
  vaultName: string;
  vaultApy: string;
  vaultUrl: string;
  chainName: string;
  chainTag: string;
  beefyHandle: string;
};
export type Types = { kind: 'normal' };
export type NormalVaultDetails = CommonVaultDetails & Types;

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
