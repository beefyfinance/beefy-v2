import type { ThunkAction } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { MessageLifecycleState } from '../../apis/cctp/cctp-api-types';
import type { ChainEntity } from '../../entities/chain';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
export declare enum StepContent {
    StartTx = 1,
    WalletTx = 2,
    WaitingTx = 3,
    ErrorTx = 4,
    SuccessTx = 5,
    BridgingTx = 6,
    RecoveryTx = 7
}
export type Step = {
    step: 'approve' | 'deposit' | 'deposit-gov' | 'withdraw' | 'deposit-erc4626' | 'request-withdraw' | 'fulfill-request-withdraw' | 'claim-withdraw' | 'claim-gov' | 'mint' | 'burn' | 'bridge' | 'zap-in' | 'zap-out' | 'migration' | 'claim-rewards' | 'boost-stake' | 'boost-unstake' | 'boost-claim' | 'boost-claim-unstake' | 'redeem';
    message: string;
    action: ThunkAction<any, any, any, any>;
    pending: boolean;
    extraInfo?: {
        vaultId?: VaultEntity['id'];
        zap?: boolean;
        rewards?: {
            token: TokenEntity;
            amount: BigNumber;
        };
        crossChain?: {
            sourceChainId: ChainEntity['id'];
            destChainId: ChainEntity['id'];
        };
    };
};
export type DstTokenReturned = {
    tokenAddress: string;
    amount: string;
};
export type BridgeStatus = {
    srcChainId: ChainEntity['id'];
    srcTxHash: string;
    destChainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    lifecycleState?: MessageLifecycleState;
    dstTxHash?: string;
    opId?: string;
    dstRefundedAmount?: string;
    dstTokensReturned?: DstTokenReturned[];
    srcTokensReturned?: DstTokenReturned[];
};
export interface StepperState {
    modal: boolean;
    currentStep: number;
    stepContent: StepContent;
    items: Step[];
    chainId: ChainEntity['id'] | null;
    bridgeStatus?: BridgeStatus;
    isRecoveryExecution?: boolean;
}
