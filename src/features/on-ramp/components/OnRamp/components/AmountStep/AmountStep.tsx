import { memo, useCallback } from 'react';
import { styles } from './styles.ts';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useTranslation } from 'react-i18next';
import { InputSwitcher } from '../InputSwitcher/InputSwitcher.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectInputMode } from '../../../../../data/selectors/on-ramp.ts';
import { FiatAmount } from '../FiatAmount/FiatAmount.tsx';
import { TokenAmount } from '../TokenAmount/TokenAmount.tsx';
import { QuoteContinue } from '../QuoteContinue/QuoteContinue.tsx';
import { FormStep, InputMode } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';

export const AmountStep = memo(function AmountStep() {
  const { t } = useTranslation();
  const inputMode = useAppSelector(selectInputMode);

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectNetwork }));
  }, [dispatch]);

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-AmountStep-Title')}
      contentCss={styles.container}
      onBack={handleBack}
    >
      <FiatAmount
        isInput={inputMode === InputMode.Fiat}
        css={inputMode === InputMode.Fiat ? styles.input : styles.output}
      />
      <InputSwitcher css={styles.switcher} />
      <TokenAmount
        isInput={inputMode === InputMode.Token}
        css={inputMode === InputMode.Token ? styles.input : styles.output}
      />
      <QuoteContinue css={styles.continue} />
    </Step>
  );
});
