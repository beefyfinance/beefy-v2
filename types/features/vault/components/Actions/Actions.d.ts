import type { VaultEntity } from '../../../data/entities/vault';
export type ActionsProps = {
    vaultId: VaultEntity['id'];
};
export declare const Actions: (({ vaultId }: ActionsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
