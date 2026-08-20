import type { VaultEntity } from '../../../data/entities/vault';
export type HistoricGraphsLoaderProps = {
    vaultId: VaultEntity['id'];
};
export declare const HistoricGraphsLoader: (({ vaultId, }: HistoricGraphsLoaderProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
