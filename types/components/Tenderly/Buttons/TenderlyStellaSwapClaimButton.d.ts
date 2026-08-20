import type { ChainEntity } from '../../../features/data/entities/chain';
import type { VaultEntity } from '../../../features/data/entities/vault';
export type TenderlyStellaSwapClaimButtonProps = {
    chainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    disabled?: boolean;
};
export declare const TenderlyStellaSwapClaimButton: (({ chainId, vaultId, disabled, }: TenderlyStellaSwapClaimButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
