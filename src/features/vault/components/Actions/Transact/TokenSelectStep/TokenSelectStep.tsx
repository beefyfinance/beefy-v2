import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { StepHeader } from '../StepHeader';
import { DepositTokenSelectList } from '../TokenSelectList';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import { selectTransactMode } from '../../../../../data/selectors/transact';
import { WithdrawTokenSelectList } from '../TokenSelectList/WithdrawTokenSelectList';

const useStyles = makeStyles(styles);

export const TokenSelectStep = memo(function () {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);
  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.Form));
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <StepHeader onBack={handleBack}>{t('Transact-SelectToken')}</StepHeader>
      {mode === TransactMode.Deposit ? <DepositTokenSelectList /> : <WithdrawTokenSelectList />}
    </div>
  );
});
