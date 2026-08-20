import { type VaultEntity } from '../../../data/entities/vault';
export type VaultHeaderProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultHeader: (({ vaultId }: VaultHeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
