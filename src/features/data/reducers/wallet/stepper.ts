import { createSlice } from '@reduxjs/toolkit';
import {
  stepperStart,
  stepperAddStep,
  stepperReset,
  stepperSetChainId,
  stepperSetModel,
  stepperSetStepContent,
  stepperUpdateCurrentStep,
  stepperUpdateCurrentStepIndex,
} from '../../actions/wallet/stepper.ts';
import { StepContent, type StepperState } from './stepper-types.ts';

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
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(stepperStart.fulfilled, (sliceState, action) => {
        const { chainId, stepIndex, modal } = action.payload;
        sliceState.chainId = chainId;
        sliceState.currentStep = stepIndex;
        sliceState.modal = modal;
      })
      .addCase(stepperReset, () => {
        return initialStepperStater;
      })
      .addCase(stepperAddStep, (sliceState, action) => {
        sliceState.items.push(action.payload.step);
      })
      .addCase(stepperUpdateCurrentStep, (sliceState, action) => {
        sliceState.items[sliceState.currentStep].pending = action.payload.pending;
      })
      .addCase(stepperUpdateCurrentStepIndex, (sliceState, action) => {
        sliceState.currentStep = action.payload.stepIndex;
      })
      .addCase(stepperSetModel, (sliceState, action) => {
        sliceState.modal = action.payload.modal;
      })
      .addCase(stepperSetChainId, (sliceState, action) => {
        sliceState.chainId = action.payload.chainId;
      })
      .addCase(stepperSetStepContent, (sliceState, action) => {
        sliceState.stepContent = action.payload.stepContent;
      });
  },
});
