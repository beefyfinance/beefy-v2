import type { GammaHypervisorData, IGammaPool } from '../types';
import type { ChainEntity } from '../../../entities/chain';
import type { AmmConfigGamma } from '../../config-types';
import BigNumber from 'bignumber.js';
import type { TokenAmount } from '../../transact/transact-types';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types';
export declare class GammaPool implements IGammaPool {
    protected address: string;
    protected amm: AmmConfigGamma;
    protected chain: ChainEntity;
    readonly type = "gamma";
    protected hypervisorData: GammaHypervisorData | undefined;
    constructor(address: string, amm: AmmConfigGamma, chain: ChainEntity);
    updateAllData(): Promise<void>;
    getHypervisorData(): GammaHypervisorData;
    getAddLiquidityRatio(testAmounts: TokenAmount[]): Promise<BigNumber>;
    getOptimalAddLiquidity(inputs: TokenAmount[]): Promise<TokenAmount[]>;
    getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
    /**
     * @dev setting insertBalance to true has the side effect of approving the token to spend itself
     */
    protected buildTokenApproveTx(token: string, spender: string, amountWei: BigNumber, insertBalance?: boolean): ZapStep;
    protected buildZapAddLiquidityTx(token0: string, token1: string, deposit0: BigNumber, deposit1: BigNumber, to: string, insertBalance: boolean): ZapStep;
    quoteRemoveLiquidity(sharesWei: BigNumber, tokenHolders: [string, ...string[]]): Promise<BigNumber[]>;
    getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
    protected buildZapRemoveLiquidityTx(shares: BigNumber, from: string, min: [BigNumber, BigNumber, BigNumber, BigNumber], insertBalance: boolean): ZapStep;
}
