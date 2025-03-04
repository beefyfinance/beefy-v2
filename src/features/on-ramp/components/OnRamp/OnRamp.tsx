import type { ComponentType } from 'react';
import { memo, useEffect } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { NetworkStep } from './components/NetworkStep/NetworkStep.tsx';
import { TokenStep } from './components/TokenStep/TokenStep.tsx';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import { LoadingStep } from '../../../../components/LoadingStep/LoadingStep.tsx';
import { fetchOnRampSupportedProviders } from '../../../data/actions/on-ramp.ts';
import { AmountStep } from './components/AmountStep/AmountStep.tsx';
import { FiatStep } from './components/FiatStep/FiatStep.tsx';
import { FormValidator } from './components/FormValidator/FormValidator.tsx';
import { UnsupportedCountryStep } from './components/UnsupportedCountryStep/UnsupportedCountryStep.tsx';
import { FormStep } from '../../../data/reducers/on-ramp-types.ts';
import {
  selectIsOnRampLoaded,
  selectShouldInitOnRamp,
  selectStep,
} from '../../../data/selectors/on-ramp.ts';
import { InjectProviderStep } from './components/InjectProviderStep/InjectProviderStep.tsx';
import { SelectProviderStep } from './components/SelectProviderStep/SelectProviderStep.tsx';

const useStyles = legacyMakeStyles(styles);

const stepToComponent: Record<FormStep, ComponentType> = {
  [FormStep.UnsupportedCountry]: UnsupportedCountryStep,
  [FormStep.SelectToken]: TokenStep,
  [FormStep.SelectNetwork]: NetworkStep,
  [FormStep.SelectFiat]: FiatStep,
  [FormStep.InputAmount]: AmountStep,
  [FormStep.SelectProvider]: SelectProviderStep,
  [FormStep.InjectProvider]: InjectProviderStep,
};

export const OnRamp = memo(function OnRamp() {
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
