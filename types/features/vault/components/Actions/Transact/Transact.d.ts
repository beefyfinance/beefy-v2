import type { VaultEntity } from '../../../../data/entities/vault';
export type TransactProps = {
    vaultId: VaultEntity['id'];
};
export declare const Transact: (({ vaultId }: TransactProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
