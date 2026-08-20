import { type VaultEntity } from '../../features/data/entities/vault';
type VaultTvlProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultTvl: (({ vaultId }: VaultTvlProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
