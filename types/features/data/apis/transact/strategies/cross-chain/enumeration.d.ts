import type { ChainEntity } from '../../../../entities/chain';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
export type VaultCandidate = {
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
};
/**
 * Candidate src vaults for a vault-to-vault deposit: scan user's deposited vaults on other
 * CCTP chains whose underlying can withdraw to the bridge token.
 */
export declare function enumerateSrcVaultCandidates(destVaultId: VaultEntity['id'], state: BeefyState, walletAddress: string | undefined, allowedChains: ReadonlySet<ChainEntity['id']>): Promise<VaultCandidate[]>;
/**
 * Candidate dst vaults for a vault-to-vault withdraw: scan active vaults on every
 * supported chain other than src that accept the bridge token as deposit.
 */
export declare function enumerateDstVaultCandidates(srcVaultId: VaultEntity['id'], state: BeefyState, allowedChains: ReadonlySet<ChainEntity['id']>): Promise<VaultCandidate[]>;
