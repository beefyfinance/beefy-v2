import type { VaultEntity } from '../../../data/entities/vault';
interface DetailsProps {
    vaultId: VaultEntity['id'];
}
export declare const Details: (({ vaultId }: DetailsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
