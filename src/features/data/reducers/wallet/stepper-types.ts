import type { ThunkAction } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { MessageLifecycleState } from '../../apis/cctp/cctp-api-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { VaultEntity } from '../../entities/vault.ts';

export enum StepContent {
  StartTx = 1,
  WalletTx,
  WaitingTx,
  ErrorTx,
  SuccessTx,
  BridgingTx,
}

export type Step = {
  step:
    | 'approve'
    | 'deposit'
    | 'deposit-gov'
    | 'withdraw'
    | 'deposit-erc4626'
    | 'request-withdraw' // erc4626 async
    | 'fulfill-request-withdraw' // erc4626 async
    | 'claim-withdraw' // gov
    | 'claim-gov' // gov
    | 'mint'
    | 'burn'
    | 'bridge'
    | 'zap-in'
    | 'zap-out'
    | 'migration'
    | 'claim-rewards' // off-chain
    | 'boost-stake'
    | 'boost-unstake'
    | 'boost-claim'
    | 'boost-claim-unstake'
    | 'redeem';
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type BridgeStatus = {
  srcChainId: ChainEntity['id'];
  srcTxHash: string;
  destChainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  lifecycleState?: MessageLifecycleState;
  dstTxHash?: string;
};

export interface StepperState {
  modal: boolean;
  currentStep: number;
  stepContent: StepContent;
  items: Step[];
  chainId: ChainEntity['id'] | null;
  bridgeStatus?: BridgeStatus;
}
