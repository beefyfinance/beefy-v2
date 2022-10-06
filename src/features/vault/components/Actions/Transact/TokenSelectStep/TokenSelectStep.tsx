import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch } from '../../../../../../store';
import { transactActions, TransactStep } from '../../../../../data/reducers/wallet/transact';
import { StepHeader } from '../StepHeader';
import { DepositTokenSelectList } from '../DepositTokenSelectList';

const useStyles = makeStyles(styles);

export const TokenSelectStep = memo(function () {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.Form));
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <StepHeader onBack={handleBack}>Select token</StepHeader>
      <DepositTokenSelectList />
    </div>
  );
});
