import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactForceSelection,
  selectTransactIsDepositFromVault,
  selectTransactVaultHasCrossChainZap,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

/**
 * Same navigation as TokenSelectButton: cross-chain + forceSelection → chain select, else token select.
 * Deposit-from-vault mode mirrors the cross-chain flow: with no source vault picked, the CTA opens the
 * vault-select step and reads "Select vault". Once a vault is picked, the caller falls back to the normal
 * disabled/deposit states (ActionConnectSwitch handles "Switch to {chain}").
 * Label mirrors DepositForm / WithdrawForm header logic.
 * Deposit/withdraw actions skip the network switch CTA while selecting (see ActionConnectSwitch chainId).
 */
export function useTransactSelectFlowCta() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const isDepositFromVault = useAppSelector(selectTransactIsDepositFromVault);
  const needsVaultPick = isDepositFromVault && !fromVaultId;
  const isSelecting = needsVaultPick || (!isDepositFromVault && forceSelection);

  const ctaLabel = useMemo(() => {
    if (needsVaultPick) {
      return t('Transact-DepositFromVault-Select');
    }
    if (forceSelection && !fromVaultId) {
      return t(hasCrossChainZap ? 'Transact-SelectChain' : 'Transact-SelectToken');
    }
    return t('Transact-SelectAmount');
  }, [forceSelection, hasCrossChainZap, fromVaultId, needsVaultPick, t]);

  const openSelectStep = useCallback(() => {
    if (needsVaultPick) {
      dispatch(transactSwitchStep(TransactStep.DepositFromVaultSelect));
    } else if (isDepositFromVault) {
      // No-op: vault already picked, nothing to open
      return;
    } else if (hasCrossChainZap && forceSelection) {
      dispatch(transactSwitchStep(TransactStep.ChainSelect));
    } else {
      dispatch(transactSwitchStep(TransactStep.TokenSelect));
    }
  }, [dispatch, hasCrossChainZap, forceSelection, isDepositFromVault, needsVaultPick]);

  return { ctaLabel, openSelectStep, isSelecting };
}
