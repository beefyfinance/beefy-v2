import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import { type VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
export type SameChainVaultCandidate = {
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
};
export declare function enumerateSameChainSrcCandidates(destVaultId: VaultEntity['id'], state: BeefyState, walletAddress: string | undefined, routingToken: TokenEntity): Promise<SameChainVaultCandidate[]>;
export declare function enumerateSameChainDstCandidates(srcVaultId: VaultEntity['id'], state: BeefyState, routingToken: TokenEntity): Promise<SameChainVaultCandidate[]>;
