import type { VaultEntity } from '../../../data/entities/vault';
export type PointsBannerLoaderProps = {
    vaultId: VaultEntity['id'];
};
export declare const PointsBannerLoader: (({ vaultId, }: PointsBannerLoaderProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
