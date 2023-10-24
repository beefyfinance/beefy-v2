import type { FC } from 'react';
import React, { memo, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectBridgeFormStep } from '../../../data/selectors/bridge';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet';
import { FormStep } from '../../../data/reducers/wallet/bridge';
import { PreviewStep } from './components/PreviewStep';
import { ConfirmStep } from './components/ConfirmStep';
import { SelectFromChainStep } from './components/SelectFromChainStep';
import { SelectToChainStep } from './components/SelectToChainStep';
import { initiateBridgeForm } from '../../../data/actions/bridge';
import { LoadingStep } from './components/LoadingStep';
import { selectIsConfigAvailable } from '../../../data/selectors/data-loader';
import { TransactionStep } from './components/TransactionStep';

const useStyles = makeStyles(styles);

const stepToComponent: Record<FormStep, FC> = {
  [FormStep.Loading]: LoadingStep,
  [FormStep.Preview]: PreviewStep,
  [FormStep.Confirm]: ConfirmStep,
  [FormStep.Transaction]: TransactionStep,
  [FormStep.SelectFromNetwork]: SelectFromChainStep,
  [FormStep.SelectToNetwork]: SelectToChainStep,
};

export const Bridge = memo(function Bridge() {
  const classes = useStyles();
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
    <div className={classes.container}>
      <StepComponent />
    </div>
  );
});
