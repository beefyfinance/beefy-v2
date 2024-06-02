import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch } from '../../../../../../store';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { StepHeader } from '../StepHeader';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import { ChainSelectList } from '../ChainSelectList';

const useStyles = makeStyles(styles);

export const ChainSelectStep = memo(function ChainSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.TokenSelect));
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <StepHeader onBack={handleBack} title={t('Transact-SelectChain')} />
      <ChainSelectList />
    </div>
  );
});
