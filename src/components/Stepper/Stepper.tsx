import { styled } from '@repo/styles/jsx';
import { type FC, memo, useEffect } from 'react';
import { stepperUpdateCurrentStep } from '../../features/data/actions/wallet/stepper.ts';
import { StepContent } from '../../features/data/reducers/wallet/stepper-types.ts';
import {
  selectStepperCurrentStepData,
  selectStepperState,
  selectStepperStepContent,
} from '../../features/data/selectors/stepper.ts';
import { isEmpty } from '../../helpers/utils.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import {
  ErrorContent,
  StepsCountContent,
  StepsStartContent,
  SuccessContent,
  WaitingContent,
} from './components/Content/Content.tsx';
import { ProgressBar } from './components/ProgressBar/ProgressBar.tsx';

const stepToComponent: Record<StepContent, FC> = {
  [StepContent.StartTx]: StepsStartContent,
  [StepContent.WalletTx]: StepsCountContent,
  [StepContent.WaitingTx]: WaitingContent,
  [StepContent.ErrorTx]: ErrorContent,
  [StepContent.SuccessTx]: SuccessContent,
};

const StepperImpl = () => {
  const dispatch = useAppDispatch();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const content = useAppSelector(selectStepperStepContent);
  const StepContent = stepToComponent[content];
  const steps = useAppSelector(selectStepperState);

  useEffect(() => {
    if (!isEmpty(currentStepData) && steps.modal && currentStepData.pending === false) {
      dispatch(stepperUpdateCurrentStep({ pending: true }));
      dispatch(currentStepData.action);
    }
  }, [currentStepData, dispatch, steps.currentStep, steps.modal]);

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
    width: '408px',
    maxWidth: 'calc(100% - 48x)',
    maxHeight: 'calc(100% - 48px)',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    position: 'fixed',
    top: '24px',
    left: '24px',
    zIndex: 'modal',
  },
});

const Inner = styled('div', {
  base: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
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
