import { type VaultEntity } from '../../entities/vault';
import type { BeefyDispatchFn, BeefyStateFn, BeefyThunk } from '../../store/types';
export declare function fetchUserOffChainRewardsForVaultAction(vaultId: VaultEntity['id'], walletAddress: string): BeefyThunk;
export declare function fetchUserOffChainRewardsForDepositedVaultsAction(walletAddress: string): (dispatch: BeefyDispatchFn, getState: BeefyStateFn) => Promise<void>;
