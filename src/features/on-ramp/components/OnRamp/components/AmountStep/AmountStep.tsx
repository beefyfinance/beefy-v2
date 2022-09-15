import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../../../../../../components/Step';
import { useTranslation } from 'react-i18next';
import { InputSwitcher } from '../InputSwitcher';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectInputMode } from '../../../../../data/selectors/on-ramp';
import { FiatAmount } from '../FiatAmount';
import { TokenAmount } from '../TokenAmount';
import { QuoteContinue } from '../QuoteContinue';
import { FormStep, InputMode } from '../../../../../data/reducers/on-ramp-types';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';

const useStyles = makeStyles(styles);

export const AmountStep = memo(function () {
  const classes = useStyles();
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
      contentClass={classes.container}
      onBack={handleBack}
    >
      <FiatAmount
        isInput={inputMode === InputMode.Fiat}
        className={inputMode === InputMode.Fiat ? classes.input : classes.output}
      />
      <InputSwitcher className={classes.switcher} />
      <TokenAmount
        isInput={inputMode === InputMode.Token}
        className={inputMode === InputMode.Token ? classes.input : classes.output}
      />
      <QuoteContinue className={classes.continue} />
    </Step>
  );
});
