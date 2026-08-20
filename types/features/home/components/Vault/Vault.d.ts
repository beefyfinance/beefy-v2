import { type VaultEntity } from '../../../data/entities/vault';
export type VaultProps = {
    vaultId: VaultEntity['id'];
};
export declare const Vault: (({ vaultId }: VaultProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
