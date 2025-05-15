import type { ComponentType } from 'react';
import { memo, useEffect } from 'react';
import { LoadingStep } from '../../../../components/LoadingStep/LoadingStep.tsx';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { fetchOnRampSupportedProviders } from '../../../data/actions/on-ramp.ts';
import { FormStep } from '../../../data/reducers/on-ramp-types.ts';
import {
  selectIsOnRampLoaded,
  selectShouldInitOnRamp,
  selectStep,
} from '../../../data/selectors/on-ramp.ts';
import { AmountStep } from './components/AmountStep/AmountStep.tsx';
import { FiatStep } from './components/FiatStep/FiatStep.tsx';
import { FormValidator } from './components/FormValidator/FormValidator.tsx';
import { InjectProviderStep } from './components/InjectProviderStep/InjectProviderStep.tsx';
import { NetworkStep } from './components/NetworkStep/NetworkStep.tsx';
import { SelectProviderStep } from './components/SelectProviderStep/SelectProviderStep.tsx';
import { TokenStep } from './components/TokenStep/TokenStep.tsx';
import { UnsupportedCountryStep } from './components/UnsupportedCountryStep/UnsupportedCountryStep.tsx';

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
    <div>
      {isLoaded ?
        <>
          <FormValidator />
          <StepComponent />
        </>
      : <LoadingStep stepType="onRamp" />}
    </div>
  );
});
