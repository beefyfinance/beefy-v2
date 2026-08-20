import type { VaultGov } from '../../../../../../../data/entities/vault';
type ClaimProps = {
    vaultId: VaultGov['id'];
};
export declare const Claim: (({ vaultId }: ClaimProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
