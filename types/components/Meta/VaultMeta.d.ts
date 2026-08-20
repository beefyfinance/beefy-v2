import { type VaultEntity } from '../../features/data/entities/vault';
export type VaultMetaProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultMeta: (({ vaultId }: VaultMetaProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
