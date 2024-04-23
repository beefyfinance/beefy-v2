import React, { memo, type MouseEventHandler, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { StepHeader } from '../StepHeader';
import { DepositTokenSelectList } from '../TokenSelectList';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import {
  selectTransactMode,
  selectTransactSelectedChainId,
  selectTransactTokenChainIds,
} from '../../../../../data/selectors/transact';
import { WithdrawTokenSelectList } from '../TokenSelectList/WithdrawTokenSelectList';
import { selectChainById } from '../../../../../data/selectors/chains';
import { ChainIcon } from '../../../../../bridge/components/Bridge/components/ChainIcon';

const useStyles = makeStyles(styles);

export const TokenSelectStep = memo(function TokenSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);

  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.Form));
  }, [dispatch]);
  const availableChains = useAppSelector(selectTransactTokenChainIds);
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const selectedChain = useAppSelector(state => selectChainById(state, selectedChainId));
  const hasMultipleChains = availableChains.length > 1;
  const handleSelectChain = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    dispatch(transactActions.switchStep(TransactStep.ChainSelect));
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <StepHeader onBack={handleBack} title={t('Transact-SelectToken')}>
        {hasMultipleChains ? (
          <button className={classes.chainSelectorBtn} onClick={handleSelectChain}>
            <ChainIcon chainId={selectedChainId} className={classes.chainSelectorIcon} />
            {selectedChain.name}
          </button>
        ) : null}
      </StepHeader>
      {mode === TransactMode.Deposit ? <DepositTokenSelectList /> : <WithdrawTokenSelectList />}
    </div>
  );
});
