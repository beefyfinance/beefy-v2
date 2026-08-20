import BigNumber from 'bignumber.js';
import { type TokenEntity } from '../../../entities/token';
import type { VaultEntity } from '../../../entities/vault';
import type { BeefyState } from '../../../store/types';
import type { OptionFeeCampaign, ZapFee, ZapQuoteStepFee } from '../transact-types';
import type { UserlessZapOrder, ZapStep } from '../zap/types';
import { type TransactOption } from '../transact-types';
export type ZapFeeEndpoint = {
    kind: 'token';
    token: TokenEntity;
} | {
    kind: 'vault';
    vaultId: VaultEntity['id'];
} | {
    kind: 'any';
};
export type ZapFeeContext = {
    input: ZapFeeEndpoint;
    output: ZapFeeEndpoint;
};
export declare function optionFeeEndpoints(option: TransactOption): ZapFeeContext | undefined;
export declare function resolveOptionFeeCampaign(state: BeefyState, option: TransactOption): OptionFeeCampaign | undefined;
export declare function computeOptionZapFee(state: BeefyState, option: TransactOption): ZapFee;
export declare function resolveZapFee(state: BeefyState, ctx: ZapFeeContext, token: TokenEntity, grossAmount: BigNumber): {
    display: ZapFee;
    step?: ZapQuoteStepFee;
} | undefined;
export declare function buildFeeZapSteps(args: {
    state: BeefyState;
    token: TokenEntity;
    grossAmount: BigNumber;
    recipient: string;
    bps: number;
}): {
    zaps: ZapStep[];
    feeAmount: BigNumber;
    netAmount: BigNumber;
};
export declare function feeZapStepsFromQuoteStep(feeStep: ZapQuoteStepFee, state: BeefyState): {
    zaps: ZapStep[];
    feeAmount: BigNumber;
};
export declare function applyWithdrawFeeToOrder(order: UserlessZapOrder, steps: ZapStep[], feeStep: ZapQuoteStepFee, state: BeefyState, slippage: number): void;
