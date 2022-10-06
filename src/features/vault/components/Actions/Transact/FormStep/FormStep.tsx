import React, { ComponentType, memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectTransactMode, selectTransactVaultId } from '../../../../../data/selectors/transact';
import { transactActions, TransactMode } from '../../../../../data/reducers/wallet/transact';
import { CardsTabs } from '../../../Card/CardTabs';
import { DepositForm } from '../DepositForm';
import { transactFetchDepositOptions } from '../../../../../data/actions/transact';

const useStyles = makeStyles(styles);

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositForm,
  [TransactMode.Withdraw]: Box,
};

export const FormStep = memo(function () {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (mode: string) => {
      dispatch(transactActions.switchMode(TransactMode[mode]));
    },
    [dispatch]
  );
  const modeOptions = useMemo(
    () => [
      { value: TransactMode[TransactMode.Deposit], label: t('Mode-Deposit') },
      { value: TransactMode[TransactMode.Withdraw], label: t('Mode-Withdraw') },
    ],
    [t]
  );

  useEffect(() => {
    if (mode === TransactMode.Deposit) {
      dispatch(transactFetchDepositOptions({ vaultId }));
    }
  }, [dispatch, mode, vaultId]);

  return (
    <div className={classes.container}>
      <CardsTabs selected={TransactMode[mode]} options={modeOptions} onChange={handleModeChange} />
      <Component />
    </div>
  );
});
