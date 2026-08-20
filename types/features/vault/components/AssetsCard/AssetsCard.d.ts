import type { VaultEntity } from '../../../data/entities/vault';
interface AssetsCardProps {
    vaultId: VaultEntity['id'];
}
export declare const AssetsCard: (({ vaultId }: AssetsCardProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
