import { type ComponentType, lazy, memo, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectShouldShowTransactClaims,
  selectTransactMode,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { CardsTabs } from '../../../Card/CardTabs';
import { transactFetchOptions } from '../../../../../data/actions/transact';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';

const useStyles = makeStyles(styles);

const DepositFormLoader = lazy(() => import('../DepositForm'));
const ClaimFormLoader = lazy(() => import('../ClaimForm'));
const WithdrawFormLoader = lazy(() => import('../WithdrawForm'));

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Claim]: ClaimFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
};

export const FormStep = memo(function FormStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const showClaim = useAppSelector(state => selectShouldShowTransactClaims(state, vaultId));
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
      ...(showClaim
        ? [{ value: TransactMode[TransactMode.Claim], label: t('Transact-Claim') }]
        : []),
      { value: TransactMode[TransactMode.Withdraw], label: t('Transact-Withdraw') },
    ],
    [t, showClaim]
  );

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId]);

  return (
    <div className={classes.container}>
      <CardsTabs selected={TransactMode[mode]} options={modeOptions} onChange={handleModeChange} />
      <Suspense fallback={<LoadingIndicator text={t('Transact-Loading')} />}>
        <Component />
      </Suspense>
    </div>
  );
});
