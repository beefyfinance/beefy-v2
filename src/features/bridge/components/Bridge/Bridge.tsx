import React, { FC, memo, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { useAppSelector, useAppStore } from '../../../../store';
import {
  selectBridgeStep,
  selectIsBridgeLoaded,
  selectShouldInitBridge,
} from '../../../data/selectors/bridge';
import { LoadingStep } from '../../../../components/LoadingStep';
import { initBridgeForm } from '../../../data/actions/scenarios';
import { selectIsWalletConnected, selectWalletAddress } from '../../../data/selectors/wallet';
import { FormStep } from '../../../data/reducers/wallet/bridge';
import { PreviewStep } from './components/PreviewStep';
import { ConfirmStep } from './components/ConfirmStep';
import { SelectFromChainStep } from './components/SelectFromChainStep';
import { SelectToChainStep } from './components/SelectToChainStep';

const useStyles = makeStyles(styles);

const stepToComponent: Record<FormStep, FC> = {
  [FormStep.Preview]: PreviewStep,
  [FormStep.Confirm]: ConfirmStep,
  [FormStep.SelectFromNetwork]: SelectFromChainStep,
  [FormStep.SelectToNetwork]: SelectToChainStep,
};

export const Bridge = memo(function () {
  const classes = useStyles();
  const step = useAppSelector(selectBridgeStep);
  const StepComponent = stepToComponent[step];
  const shouldInit = useAppSelector(selectShouldInitBridge);
  const isLoaded = useAppSelector(selectIsBridgeLoaded);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const walletAddress = useAppSelector(state =>
    isWalletConnected ? selectWalletAddress(state) : null
  );
  const store = useAppStore();

  useEffect(() => {
    if (shouldInit) {
      initBridgeForm(store, walletAddress);
    }
  }, [shouldInit, store, walletAddress]);

  return (
    <div className={classes.container}>
      {isLoaded ? <StepComponent /> : <LoadingStep stepType={'bridge'} />}
    </div>
  );
});
