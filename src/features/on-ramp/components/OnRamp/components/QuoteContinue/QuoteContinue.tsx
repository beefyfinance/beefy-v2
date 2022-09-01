import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectCanQuote, selectHaveQuote } from '../../../../../data/selectors/on-ramp';
import { QuoteBest } from '../QuoteBest';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type QuoteContinueProps = {
  className?: string;
};
export const QuoteContinue = memo<QuoteContinueProps>(function QuoteContinue({ className }) {
  const classes = useStyles();
  const canQuote = useAppSelector(selectCanQuote);
  const haveQuote = useAppSelector(selectHaveQuote);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleContinue = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.InjectProvider }));
  }, [dispatch]);

  return (
    <div className={clsx(classes.container, className)}>
      {canQuote ? <QuoteBest /> : null}
      <Button
        variant="success"
        disabled={!canQuote || !haveQuote}
        fullWidth={true}
        borderless={true}
        onClick={handleContinue}
      >
        {t('OnRamp-Continue')}
      </Button>
    </div>
  );
});
