import BigNumber from 'bignumber.js';
import type { VaultStandard, VaultWithPricePerFullShare } from '../../../entities/vault';
import type { BeefyState } from '../../../store/types';
import type { InputTokenAmount } from '../transact-types';
export declare function getVaultWithdrawnFromState(userInput: InputTokenAmount, vault: VaultWithPricePerFullShare, state: BeefyState, userAddress?: string): {
    withdrawAll: boolean;
    requestedAmountWei: BigNumber;
    sharesToWithdrawWei: BigNumber;
    withdrawnAmountWei: BigNumber;
    withdrawnAmountAfterFeeWei: BigNumber;
    withdrawnToken: import("../../../entities/token").TokenErc20 | import("../../../entities/token").TokenNative;
    shareToken: import("../../../entities/token").TokenErc20;
};
export declare function getVaultWithdrawnFromContract(userInput: InputTokenAmount, vault: VaultStandard, state: BeefyState, userAddress: string): Promise<{
    withdrawAll: boolean;
    requestedAmountWei: BigNumber;
    sharesToWithdrawWei: BigNumber;
    withdrawnAmountWei: BigNumber;
    withdrawnAmountAfterFeeWei: BigNumber;
    withdrawnToken: import("../../../entities/token").TokenErc20 | import("../../../entities/token").TokenNative;
    shareToken: import("../../../entities/token").TokenErc20;
}>;
