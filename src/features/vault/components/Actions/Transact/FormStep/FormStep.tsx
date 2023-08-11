import type { ComponentType } from 'react';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectTransactMode, selectTransactVaultId } from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { CardsTabs } from '../../../Card/CardTabs';
import { DepositFormLoader } from '../DepositForm';
import { transactFetchOptions } from '../../../../../data/actions/transact';
import { WithdrawFormLoader } from '../WithdrawForm';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types';
import { selectIsVaultRetired } from '../../../../../data/selectors/vaults';

const useStyles = makeStyles(styles);

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
};

export const FormStep = memo(function FormStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const hideDeposit = useAppSelector(state => selectIsVaultRetired(state, vaultId));
  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (mode: string) => {
      dispatch(transactActions.switchMode(TransactMode[mode]));
    },
    [dispatch]
  );
  const modeOptions = useMemo(
    () =>
      [
        { value: TransactMode[TransactMode.Deposit], label: t('Transact-Deposit') },
        { value: TransactMode[TransactMode.Withdraw], label: t('Transact-Withdraw') },
      ].slice(hideDeposit ? 1 : 0),
    [t, hideDeposit]
  );

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId, handleModeChange, hideDeposit]);

  return (
    <div className={classes.container}>
      <CardsTabs selected={TransactMode[mode]} options={modeOptions} onChange={handleModeChange} />
      <Component />
    </div>
  );
});
