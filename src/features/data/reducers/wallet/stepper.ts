import type { PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { startStepper } from '../../actions/stepper.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { VaultEntity } from '../../entities/vault.ts';

export enum StepContent {
  StartTx = 1,
  WalletTx,
  WaitingTx,
  ErrorTx,
  SuccessTx,
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
    | 'boost-claim-unstake';
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
  };
};

export interface StepperState {
  modal: boolean;
  currentStep: number;
  stepContent: StepContent;
  items: Step[];
  chainId: ChainEntity['id'] | null;
}

export const initialStepperStater: StepperState = {
  modal: false,
  currentStep: -1,
  stepContent: StepContent.StartTx,
  items: [],
  chainId: null,
};

export const stepperSlice = createSlice({
  name: 'stepper',
  initialState: initialStepperStater,
  reducers: {
    reset() {
      return initialStepperStater;
    },
    addStep(
      sliceState,
      action: PayloadAction<{
        step: Step;
      }>
    ) {
      sliceState.items.push(action.payload.step);
    },
    updateCurrentStep(
      sliceState,
      action: PayloadAction<{
        pending: boolean;
      }>
    ) {
      const { pending } = action.payload;
      sliceState.items[sliceState.currentStep].pending = pending;
    },
    updateCurrentStepIndex(
      sliceState,
      action: PayloadAction<{
        stepIndex: number;
      }>
    ) {
      sliceState.currentStep = action.payload.stepIndex;
    },
    setModal(
      sliceState,
      action: PayloadAction<{
        modal: boolean;
      }>
    ) {
      sliceState.modal = action.payload.modal;
    },
    setChainId(
      sliceState,
      action: PayloadAction<{
        chainId: ChainEntity['id'];
      }>
    ) {
      sliceState.chainId = action.payload.chainId;
    },
    setStepContent(
      sliceState,
      action: PayloadAction<{
        stepContent: StepContent;
      }>
    ) {
      sliceState.stepContent = action.payload.stepContent;
    },
  },
  extraReducers: builder => {
    builder.addCase(startStepper.fulfilled, (sliceState, action) => {
      const { chainId, stepIndex, modal } = action.payload;
      sliceState.chainId = chainId;
      sliceState.currentStep = stepIndex;
      sliceState.modal = modal;
    });
  },
});

export const stepperActions = stepperSlice.actions;
