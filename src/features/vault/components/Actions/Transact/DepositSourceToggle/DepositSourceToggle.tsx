import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ToggleButtons,
  type ToggleButtonItem,
} from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { transactSwitchDepositSource } from '../../../../../data/actions/transact.ts';
import { DepositSource } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactDepositSource,
  selectTransactExecuting,
  selectTransactUserHasOtherDepositedVaults,
} from '../../../../../data/selectors/transact.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { styled } from '@repo/styles/jsx';

export const DepositSourceToggle = memo(function DepositSourceToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const source = useAppSelector(selectTransactDepositSource);
  const hasOtherDeposits = useAppSelector(selectTransactUserHasOtherDepositedVaults);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);
  const isDisabled = isExecuting || isStepping;

  const handleChange = useCallback(
    (next: DepositSource) => {
      dispatch(transactSwitchDepositSource(next));
    },
    [dispatch]
  );

  const options = useMemo<Array<ToggleButtonItem<DepositSource>>>(
    () => [
      {
        value: DepositSource.Wallet,
        label: t('Transact-DepositSource-Wallet-Title'),
        subtitle: t('Transact-DepositSource-Wallet-Subtitle'),
      },
      {
        value: DepositSource.Vault,
        label: t('Transact-DepositSource-Vault-Title'),
        subtitle: t('Transact-DepositSource-Vault-Subtitle'),
      },
    ],
    [t]
  );

  if (!hasOtherDeposits) {
    return null;
  }

  return (
    <Container>
      <ToggleButtons
        value={source}
        options={options}
        onChange={handleChange}
        variant="card"
        fullWidth={true}
        disabled={isDisabled}
      />
    </Container>
  );
});

const Container = styled('div', {
  base: {
    height: '82px',
  },
});
