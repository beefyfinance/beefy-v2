import type { VaultEntity } from '../../../../../../data/entities/vault';
interface HeaderProps {
    vaultId: VaultEntity['id'];
}
export declare const Header: (({ vaultId }: HeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
