import type { ComponentType } from 'react';
import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../data/store/hooks.ts';
import { transactClearInput, transactInit } from '../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { TransactStep } from '../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactMode,
  selectTransactPendingVaultIdOrUndefined,
  selectTransactStep,
  selectTransactVaultIdOrUndefined,
} from '../../../../data/selectors/transact.ts';
import { selectClmGroupIdOrUndefined } from '../../../../data/selectors/vaults.ts';
import { Card } from '../../Card/Card.tsx';
import { DepositFromVaultSelectStep } from './DepositFromVaultSelectStep/DepositFromVaultSelectStep.tsx';
import { FormStep } from './FormStep/FormStep.tsx';
import { FormTabs } from './FormStep/FormTabs.tsx';
import { LoadingStep } from './LoadingStep/LoadingStep.tsx';
import { QuoteSelectStep } from './QuoteSelectStep/QuoteSelectStep.tsx';
import { TokenSelectStep } from './TokenSelectStep/TokenSelectStep.tsx';
import { ChainSelectStep } from './ChainSelectStep/ChainSelectStep.tsx';

const stepToComponent: Record<TransactStep, ComponentType> = {
  [TransactStep.Loading]: LoadingStep,
  [TransactStep.Form]: FormStep,
  [TransactStep.ChainSelect]: ChainSelectStep,
  [TransactStep.TokenSelect]: TokenSelectStep,
  [TransactStep.QuoteSelect]: QuoteSelectStep,
  [TransactStep.DepositFromVaultSelect]: DepositFromVaultSelectStep,
};

export type TransactProps = {
  vaultId: VaultEntity['id'];
};
export const Transact = memo(function Transact({ vaultId }: TransactProps) {
  const transactStep = useAppSelector(selectTransactStep);
  const transactVaultId = useAppSelector(selectTransactVaultIdOrUndefined);
  const pendingVaultId = useAppSelector(selectTransactPendingVaultIdOrUndefined);
  const transactMode = useAppSelector(selectTransactMode);
  const isReady = transactVaultId === vaultId;
  // both sides of one CLM share a page, so switching wrapper should not blank the card
  const pageGroupId = useAppSelector(state => selectClmGroupIdOrUndefined(state, vaultId));
  const loadedGroupId = useAppSelector(state =>
    transactVaultId ? selectClmGroupIdOrUndefined(state, transactVaultId) : undefined
  );
  const retarget = !isReady && pageGroupId !== undefined && pageGroupId === loadedGroupId;
  const step = isReady || retarget ? transactStep : TransactStep.Loading;
  const StepComponent = stepToComponent[step];
  const dispatch = useAppDispatch();

  useEffect(() => {
    // don't re-init over a targeted init (e.g. CLM mode switch keeping the current tab)
    if (!isReady && pendingVaultId !== vaultId) {
      // Retargeting to another side of the same CLM must keep the tab the user is on — without
      // this, opening Withdraw changes the vault id, re-inits with no mode, and snaps back to
      // Deposit. A genuine first load has no previous vault, so the computed default wins there.
      // only a retarget keeps the current tab; the store's vault id survives navigation, so keying
      // on "a previous vault exists" would carry the last page's tab onto every vault opened after
      dispatch(transactInit({ vaultId, mode: retarget ? transactMode : undefined, retarget }));
    }
  }, [dispatch, vaultId, isReady, pendingVaultId, transactVaultId, transactMode, retarget]);

  useEffect(() => {
    return () => {
      dispatch(transactClearInput());
    };
  }, [dispatch]);

  // the tabs live here rather than inside FormStep so a yield-mode switch, which momentarily
  // clears the store's vault id, does not tear the whole card down and rebuild it
  const showTabs = step === TransactStep.Form || step === TransactStep.Loading;

  return (
    <Card>
      {showTabs ?
        <FormTabs vaultId={vaultId} />
      : null}
      <StepComponent key={step} />
    </Card>
  );
});
