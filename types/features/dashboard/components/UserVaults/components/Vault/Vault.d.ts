import { type VaultEntity } from '../../../../../data/entities/vault';
export type VaultProps = {
    vaultId: VaultEntity['id'];
    address: string;
};
export declare const Vault: (({ vaultId, address }: VaultProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
