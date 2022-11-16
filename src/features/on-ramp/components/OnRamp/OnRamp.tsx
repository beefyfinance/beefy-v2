import React, { ComponentType, memo, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { NetworkStep } from './components/NetworkStep';
import { TokenStep } from './components/TokenStep';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { LoadingStep } from '../../../../components/LoadingStep';
import { fetchOnRampSupportedProviders } from '../../../data/actions/on-ramp';
import { AmountStep } from './components/AmountStep';
import { FiatStep } from './components/FiatStep';
import { FormValidator } from './components/FormValidator';
import { UnsupportedCountryStep } from './components/UnsupportedCountryStep';
import { FormStep } from '../../../data/reducers/on-ramp-types';
import {
  selectIsOnRampLoaded,
  selectShouldInitOnRamp,
  selectStep,
} from '../../../data/selectors/on-ramp';
import { InjectProviderStep } from './components/InjectProviderStep';
import { SelectProviderStep } from './components/SelectProviderStep';

const useStyles = makeStyles(styles);

const stepToComponent: Record<FormStep, ComponentType> = {
  [FormStep.UnsupportedCountry]: UnsupportedCountryStep,
  [FormStep.SelectToken]: TokenStep,
  [FormStep.SelectNetwork]: NetworkStep,
  [FormStep.SelectFiat]: FiatStep,
  [FormStep.InputAmount]: AmountStep,
  [FormStep.SelectProvider]: SelectProviderStep,
  [FormStep.InjectProvider]: InjectProviderStep,
};

export const OnRamp = memo(function () {
  const classes = useStyles();
  const step = useAppSelector(selectStep);
  const StepComponent = stepToComponent[step];
  const dispatch = useAppDispatch();
  const shouldInit = useAppSelector(selectShouldInitOnRamp);
  const isLoaded = useAppSelector(selectIsOnRampLoaded);

  useEffect(() => {
    if (shouldInit) {
      dispatch(fetchOnRampSupportedProviders());
    }
  }, [dispatch, shouldInit]);

  return (
    <div className={classes.container}>
      {isLoaded ? (
        <>
          <FormValidator />
          <StepComponent />
        </>
      ) : (
        <LoadingStep stepType="onRamp" />
      )}
    </div>
  );
});
