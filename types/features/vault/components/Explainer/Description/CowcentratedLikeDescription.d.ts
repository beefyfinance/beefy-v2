import { type VaultCowcentrated, type VaultGov } from '../../../../data/entities/vault';
export type CowcentratedDescriptionProps = {
    vaultId: VaultCowcentrated['id'];
    poolId?: VaultGov['id'];
};
export declare const CowcentratedLikeDescription: (({ vaultId, }: CowcentratedDescriptionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
