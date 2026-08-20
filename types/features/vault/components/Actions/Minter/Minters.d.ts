import type { PropsWithChildren } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault';
export type MinterCardsParams = PropsWithChildren<{
    vaultId: VaultEntity['id'];
}>;
export declare const Minters: (({ vaultId }: MinterCardsParams) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
