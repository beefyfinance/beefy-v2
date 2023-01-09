import React, { ComponentType, memo, useCallback, useEffect, useMemo } from 'react';
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

const useStyles = makeStyles(styles);

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
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
      { value: TransactMode[TransactMode.Deposit], label: t('Transact-Deposit') },
      { value: TransactMode[TransactMode.Withdraw], label: t('Transact-Withdraw') },
    ],
    [t]
  );

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId]);

  return (
    <div className={classes.container}>
      <CardsTabs selected={TransactMode[mode]} options={modeOptions} onChange={handleModeChange} />
      <Component />
    </div>
  );
});
