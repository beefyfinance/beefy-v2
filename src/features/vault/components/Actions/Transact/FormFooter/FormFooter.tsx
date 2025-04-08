import { lazy, memo } from 'react';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactMode,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';

const BeSonicFooter = lazy(() => import('./BeSonicFooter.tsx'));

export const FormFooter = memo(function FormFooter() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const mode = useAppSelector(selectTransactMode);
  if (vaultId === 'beefy-besonic' && (mode === TransactMode.Deposit || TransactMode.Withdraw)) {
    return <BeSonicFooter />;
  }
  return null;
});
