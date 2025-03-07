import type { ComponentType } from 'react';
import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { useAppDispatch, useAppSelector } from '../../../../../store.ts';
import { transactInit } from '../../../../data/actions/transact.ts';
import {
  selectTransactStep,
  selectTransactVaultIdOrUndefined,
} from '../../../../data/selectors/transact.ts';
import { LoadingStep } from './LoadingStep/LoadingStep.tsx';
import { FormStep } from './FormStep/FormStep.tsx';
import { Card } from '../../Card/Card.tsx';
import { TokenSelectStep } from './TokenSelectStep/TokenSelectStep.tsx';
import { TransactStep } from '../../../../data/reducers/wallet/transact-types.ts';
import { QuoteSelectStep } from './QuoteSelectStep/QuoteSelectStep.tsx';

const stepToComponent: Record<TransactStep, ComponentType> = {
  [TransactStep.Loading]: LoadingStep,
  [TransactStep.Form]: FormStep,
  [TransactStep.TokenSelect]: TokenSelectStep,
  [TransactStep.QuoteSelect]: QuoteSelectStep,
};

export type TransactProps = {
  vaultId: VaultEntity['id'];
};
export const Transact = memo(function Transact({ vaultId }: TransactProps) {
  const transactStep = useAppSelector(selectTransactStep);
  const transactVaultId = useAppSelector(selectTransactVaultIdOrUndefined);
  const isReady = transactVaultId === vaultId;
  const step = isReady ? transactStep : TransactStep.Loading;
  const StepComponent = stepToComponent[step];
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isReady) {
      dispatch(transactInit({ vaultId }));
    }
  }, [dispatch, vaultId, isReady]);

  return (
    <Card>
      <StepComponent key={step} />
    </Card>
  );
});
