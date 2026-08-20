import type { VaultEntity } from '../../../../../../data/entities/vault';
export interface LegendProps {
    vaultId: VaultEntity['id'];
}
export declare const Legend: (({ vaultId }: LegendProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
