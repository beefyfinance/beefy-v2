import type { ChainEntity } from '../../../../../../../data/entities/chain';
import type { VaultEntity } from '../../../../../../../data/entities/vault';
type ClaimProps = {
    chainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    withChain?: boolean;
};
export declare const Claim: (({ chainId, vaultId, withChain }: ClaimProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
