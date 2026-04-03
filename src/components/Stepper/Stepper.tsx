import { styled } from '@repo/styles/jsx';
import { type FC, memo, useEffect } from 'react';
import { crossChainClearRecoveryQuote } from '../../features/data/actions/wallet/cross-chain.ts';
import {
  stepperSetRecoveryExecution,
  stepperSetStepContent,
  stepperUpdateCurrentStep,
} from '../../features/data/actions/wallet/stepper.ts';
import { StepContent as StepContentEnum } from '../../features/data/reducers/wallet/stepper-types.ts';
import {
  selectIsStepperRecoveryExecution,
  selectStepperCurrentStepData,
  selectStepperState,
  selectStepperStepContent,
} from '../../features/data/selectors/stepper.ts';
import { isEmpty } from '../../helpers/utils.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import {
  BridgingContent,
  ErrorContent,
  RecoveryContent,
  StepsCountContent,
  StepsStartContent,
  SuccessContent,
  WaitingContent,
} from './components/Content/Content.tsx';
import { ProgressBar } from './components/ProgressBar/ProgressBar.tsx';

const stepToComponent: Record<StepContentEnum, FC> = {
  [StepContentEnum.StartTx]: StepsStartContent,
  [StepContentEnum.WalletTx]: StepsCountContent,
  [StepContentEnum.WaitingTx]: WaitingContent,
  [StepContentEnum.ErrorTx]: ErrorContent,
  [StepContentEnum.SuccessTx]: SuccessContent,
  [StepContentEnum.BridgingTx]: BridgingContent,
  [StepContentEnum.RecoveryTx]: RecoveryContent,
};

const StepperImpl = () => {
  const dispatch = useAppDispatch();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const content = useAppSelector(selectStepperStepContent);
  const StepContent = stepToComponent[content];
  const steps = useAppSelector(selectStepperState);
  const isRecoveryExecution = useAppSelector(selectIsStepperRecoveryExecution);

  useEffect(() => {
    if (!isEmpty(currentStepData) && steps.modal && currentStepData.pending === false) {
      dispatch(stepperUpdateCurrentStep({ pending: true }));
      dispatch(currentStepData.action);
    }
  }, [currentStepData, dispatch, steps.currentStep, steps.modal]);

  useEffect(() => {
    if (isRecoveryExecution && content === StepContentEnum.ErrorTx && steps.modal) {
      dispatch(crossChainClearRecoveryQuote());
      dispatch(stepperSetRecoveryExecution(false));
      dispatch(stepperSetStepContent({ stepContent: StepContentEnum.RecoveryTx }));
    }
  }, [isRecoveryExecution, content, steps.modal, dispatch]);

  if (!steps.modal) {
    return null;
  }

  return (
    <Modal>
      <Inner>
        <ProgressBar />
        <Content>
          <StepContent />
        </Content>
      </Inner>
    </Modal>
  );
};

const Modal = styled('div', {
  base: {
    position: 'fixed',
    zIndex: 'modal',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    top: '12px',
    left: '12px',
    right: '12px',
    maxHeight: 'calc(100% - 24px)',
    sm: {
      width: '408px',
      top: '24px',
      left: '24px',
      right: 'auto',
      maxHeight: 'calc(100% - 48px)',
    },
  },
});

const Inner = styled('div', {
  base: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
    borderRadius: '16px',
    overflow: 'hidden',
  },
});

const Content = styled('div', {
  base: {
    color: 'blackMarket',
    backgroundColor: 'white',
    borderRadius: '0 0 4px 4px',
    padding: '12px 16px',
    minHeight: '0',
    flexShrink: '1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
});

export const Stepper = memo(StepperImpl);
