import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  transactClearInput,
  transactSetSuccessClosed,
  transactSwitchMode,
} from '../../../../../features/data/actions/transact.ts';
import { stepperReset } from '../../../../../features/data/actions/wallet/stepper.ts';
import { TransactMode } from '../../../../../features/data/reducers/wallet/transact-types.ts';
import { selectTransactMode } from '../../../../../features/data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { Button } from '../../../../Button/Button.tsx';

/** Close the stepper without clearing inputs/quotes (e.g. on error, user can retry) */
export const CloseButton = memo(function CloseButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(stepperReset());
  }, [dispatch]);

  return (
    <Button borderless={true} fullWidth={true} variant="default" onClick={handleClose}>
      {t('Transactn-Close')}
    </Button>
  );
});

/** Close the stepper AND clear inputs/quotes (after a successful tx) */
export const CloseAndResetButton = memo(function CloseAndResetButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearInput());
    dispatch(stepperReset());
    if (mode === TransactMode.Migrate) {
      dispatch(transactSwitchMode(TransactMode.Deposit));
    }
  }, [dispatch, mode]);

  return (
    <Button borderless={true} fullWidth={true} variant="default" onClick={handleClose}>
      {t('Transactn-Close')}
    </Button>
  );
});
