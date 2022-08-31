import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { InputSwitcher } from '../InputSwitcher';
import { useAppSelector } from '../../../../../../store';
import { selectInputMode } from '../../../../../data/selectors/on-ramp';
import { FiatAmount } from '../FiatAmount';
import { TokenAmount } from '../TokenAmount';
import { QuoteContinue } from '../QuoteContinue';
import { FormStep, InputMode } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export const AmountStep = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const inputMode = useAppSelector(selectInputMode);

  return (
    <Step
      title={t('OnRamp-AmountStep-Title')}
      contentClass={classes.container}
      backStep={FormStep.SelectNetwork}
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
