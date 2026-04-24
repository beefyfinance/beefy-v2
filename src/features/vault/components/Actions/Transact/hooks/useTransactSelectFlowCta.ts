import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import {
  DepositSource,
  TransactMode,
  TransactStep,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactDepositSource,
  selectTransactForceSelection,
  selectTransactMode,
  selectTransactUserHasOtherDepositedVaults,
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
  const mode = useAppSelector(selectTransactMode);
  const depositSource = useAppSelector(selectTransactDepositSource);
  const hasOtherDeposits = useAppSelector(selectTransactUserHasOtherDepositedVaults);
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const isDepositFromVault =
    mode === TransactMode.Deposit && hasOtherDeposits && depositSource === DepositSource.Vault;
  const needsVaultPick = isDepositFromVault && !fromVaultId;
  const isSelecting = needsVaultPick || (!isDepositFromVault && forceSelection);

  const ctaLabel = useMemo(() => {
    if (needsVaultPick) {
      return t('Transact-DepositFromVault-Select');
    }
    if (isDepositFromVault) {
      // Vault picked: placeholder Select amount (no quote fetched in vault-mode)
      return t('Transact-SelectAmount');
    }
    if (hasCrossChainZap && forceSelection) {
      return t('Transact-SelectChain');
    }
    if (forceSelection) {
      return t('Transact-SelectToken');
    }
    return t('Transact-SelectAmount');
  }, [forceSelection, hasCrossChainZap, isDepositFromVault, needsVaultPick, t]);

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
