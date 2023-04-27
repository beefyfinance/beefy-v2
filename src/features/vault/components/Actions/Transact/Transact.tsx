import type { ComponentType } from 'react';
import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import { transactInit } from '../../../../data/actions/transact';
import { selectTransactStep, selectTransactVaultId } from '../../../../data/selectors/transact';
import { LoadingStep } from './LoadingStep';
import { FormStep } from './FormStep';
import { Card } from '../../Card';
import { TokenSelectStep } from './TokenSelectStep';
import { TransactStep } from '../../../../data/reducers/wallet/transact-types';
import { QuoteSelectStep } from './QuoteSelectStep';

const stepToComponent: Record<TransactStep, ComponentType> = {
  [TransactStep.Loading]: LoadingStep,
  [TransactStep.Form]: FormStep,
  [TransactStep.TokenSelect]: TokenSelectStep,
  [TransactStep.QuoteSelect]: QuoteSelectStep,
};

export type TransactProps = {
  vaultId: VaultEntity['id'];
};
export const Transact = memo<TransactProps>(function Transact({ vaultId }) {
  const transactStep = useAppSelector(selectTransactStep);
  const transactVaultId = useAppSelector(selectTransactVaultId);
  const step = transactVaultId === vaultId ? transactStep : TransactStep.Loading;
  const StepComponent = stepToComponent[step];
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(transactInit({ vaultId }));
  }, [dispatch, vaultId]);

  return (
    <Card>
      <StepComponent key={step} />
    </Card>
  );
});
