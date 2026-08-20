import type { MinterEntity } from '../../../../data/entities/minter';
import type { VaultEntity } from '../../../../data/entities/vault';
export interface MinterCardParams {
    vaultId: VaultEntity['id'];
    minterId: MinterEntity['id'];
}
export declare const MinterCard: (({ vaultId, minterId }: MinterCardParams) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const LoadingCard: (() => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
