import type { VaultEntity } from '../../../data/entities/vault';
export type PoolTogetherCardProps = {
    vaultId: VaultEntity['id'];
};
export declare const PoolTogetherCard: (({ vaultId }: PoolTogetherCardProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
