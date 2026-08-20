import type { VaultEntity } from '../../features/data/entities/vault';
type ApyStatsProps = {
    vaultId: VaultEntity['id'];
    type: 'yearly' | 'daily';
};
export declare const ApyStats: (({ vaultId, type }: ApyStatsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
