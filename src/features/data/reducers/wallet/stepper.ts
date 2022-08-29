import { createSlice, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import { startStepper } from '../../actions/stepper';
import { ChainEntity } from '../../entities/chain';

export type Step = {
  step:
    | 'approve'
    | 'stake'
    | 'unstake'
    | 'deposit'
    | 'withdraw'
    | 'claim-unstake'
    | 'claim-withdraw'
    | 'claim-boost'
    | 'claim-gov'
    | 'mint'
    | 'burn'
    | 'bridge';
  message: string;
  action: ThunkAction<any, any, any, any>;
  pending: boolean;
};

export interface StepperState {
  modal: boolean;
  currentStep: number;
  items: Step[];
  finished: boolean;
  chainId: ChainEntity['id'] | null;
}

export const initialStepperStater: StepperState = {
  modal: false,
  currentStep: -1,
  items: [],
  finished: false,
  chainId: null,
};

export const stepperSlice = createSlice({
  name: 'stepper',
  initialState: initialStepperStater,
  reducers: {
    reset() {
      return initialStepperStater;
    },
    addStep(sliceState, action: PayloadAction<{ step: Step }>) {
      sliceState.items.push(action.payload.step);
    },
    updateCurrentStep(sliceState, action: PayloadAction<{ pending: boolean }>) {
      const { pending } = action.payload;
      sliceState.items[sliceState.currentStep].pending = pending;
    },
    updateCurrentStepIndex(sliceState, action: PayloadAction<{ stepIndex: number }>) {
      sliceState.currentStep = action.payload.stepIndex;
    },
    setFinished(sliceState, action: PayloadAction<{ finished: boolean }>) {
      sliceState.finished = action.payload.finished;
    },
    setModal(sliceState, action: PayloadAction<{ modal: boolean }>) {
      sliceState.modal = action.payload.modal;
    },
    setChainId(sliceState, action: PayloadAction<{ chainId: ChainEntity['id'] }>) {
      sliceState.chainId = action.payload.chainId;
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
