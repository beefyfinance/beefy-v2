import type { ChainEntity } from '../../../../entities/chain';
import type { TokenEntity } from '../../../../entities/token';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../store/types';
export declare function vaultAcceptsTokenDeposit(vaultId: VaultEntity['id'], state: BeefyState, token: TokenEntity): Promise<boolean>;
export declare function vaultCanWithdrawToToken(vaultId: VaultEntity['id'], state: BeefyState, token: TokenEntity): Promise<boolean>;
export declare function userHasPositionIn(vaultId: VaultEntity['id'], state: BeefyState, walletAddress: string | undefined): boolean;
export declare function isCrossChainHopEligible(pageChainId: ChainEntity['id'], otherChainId: ChainEntity['id']): boolean;
export declare function getV2VRelevantChainsFor(state: BeefyState, vaultId: VaultEntity['id']): ChainEntity['id'][];
