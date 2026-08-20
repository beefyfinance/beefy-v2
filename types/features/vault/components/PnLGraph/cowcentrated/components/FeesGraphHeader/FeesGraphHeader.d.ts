import type { VaultEntity } from '../../../../../../data/entities/vault';
interface FeesGraphHeaderProps {
    vaultId: VaultEntity['id'];
    address?: string;
}
export declare const FeesGraphHeader: (({ vaultId, address, }: FeesGraphHeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
