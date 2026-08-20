import type BigNumber from 'bignumber.js';
import type { BoostReward, Erc4626PendingBalanceRequest, GovVaultReward } from '../../apis/balance/balance-types';
import type { ChainEntity } from '../../entities/chain';
import type { BoostPromoEntity } from '../../entities/promo';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
/**
 * State containing user balances state
 */
export interface BalanceState {
    byAddress: {
        [address: string]: {
            depositedVaultIds: VaultEntity['id'][];
            /**
             * all balances below represent token amounts
             */
            tokenAmount: {
                /**
                 * Token balance, used to know standard vault balance with earnToken (mooXyzToken)
                 * and oracle balance, to display how much the user can put in a vault or boost
                 */
                byChainId: {
                    [chainId in ChainEntity['id']]?: {
                        byTokenAddress: {
                            [tokenAddress: TokenEntity['address']]: {
                                balance: BigNumber;
                            };
                        };
                    };
                };
                /**
                 * The boost balance to know how much we withdraw from the boost
                 * and how much rewards we can claim
                 */
                byBoostId: {
                    [boostId: BoostPromoEntity['id']]: {
                        balance: BigNumber;
                        rewards: BoostReward[];
                    };
                };
                /**
                 * The gov vault token balance and pending rewards
                 */
                byGovVaultId: {
                    [vaultId: VaultEntity['id']]: {
                        balance: BigNumber;
                        rewards: GovVaultReward[];
                    };
                };
                byVaultId: {
                    [vaultId: VaultEntity['id']]: {
                        pendingWithdrawals: {
                            shares: BigNumber;
                            requests: Erc4626PendingBalanceRequest[];
                        };
                    };
                };
            };
        };
    };
}
