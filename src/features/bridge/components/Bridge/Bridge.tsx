import type { FC } from 'react';
import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { initiateBridgeForm } from '../../../data/actions/bridge.ts';
import { FormStep } from '../../../data/reducers/wallet/bridge-types.ts';
import { selectBridgeFormStep } from '../../../data/selectors/bridge.ts';
import { selectIsConfigAvailable } from '../../../data/selectors/config.ts';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet.ts';
import { ConfirmStep } from './components/ConfirmStep/ConfirmStep.tsx';
import { LoadingStep } from './components/LoadingStep/LoadingStep.tsx';
import { PreviewStep } from './components/PreviewStep/PreviewStep.tsx';
import { SelectFromChainStep } from './components/SelectFromChainStep/SelectFromChainStep.tsx';
import { SelectToChainStep } from './components/SelectToChainStep/SelectToChainStep.tsx';
import { TransactionStep } from './components/TransactionStep/TransactionStep.tsx';

const stepToComponent: Record<FormStep, FC> = {
  [FormStep.Loading]: LoadingStep,
  [FormStep.Preview]: PreviewStep,
  [FormStep.Confirm]: ConfirmStep,
  [FormStep.Transaction]: TransactionStep,
  [FormStep.SelectFromNetwork]: SelectFromChainStep,
  [FormStep.SelectToNetwork]: SelectToChainStep,
};

export const Bridge = memo(function Bridge() {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const step = useAppSelector(selectBridgeFormStep);
  const StepComponent = stepToComponent[step];
  const globalConfigLoaded = useAppSelector(selectIsConfigAvailable);

  useEffect(() => {
    if (globalConfigLoaded) {
      dispatch(initiateBridgeForm({ walletAddress }));
    }
  }, [dispatch, walletAddress, globalConfigLoaded]);

  return (
    <div>
      <StepComponent />
    </div>
  );
});
