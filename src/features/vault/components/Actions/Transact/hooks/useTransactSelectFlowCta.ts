import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactForceSelection,
  selectTransactVaultHasCrossChainZap,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

/**
 * Same navigation as TokenSelectButton: cross-chain + forceSelection → chain select, else token select.
 * Label mirrors DepositForm / WithdrawForm header logic.
 * Deposit/withdraw actions skip the network switch CTA while forceSelection (see ActionConnectSwitch chainId).
 */
export function useTransactSelectFlowCta() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);

  const ctaLabel = useMemo(() => {
    if (hasCrossChainZap && forceSelection) {
      return t('Transact-SelectChain');
    }
    if (forceSelection) {
      return t('Transact-SelectToken');
    }
    return t('Transact-SelectAmount');
  }, [forceSelection, hasCrossChainZap, t]);

  const openSelectStep = useCallback(() => {
    if (hasCrossChainZap && forceSelection) {
      dispatch(transactSwitchStep(TransactStep.ChainSelect));
    } else {
      dispatch(transactSwitchStep(TransactStep.TokenSelect));
    }
  }, [dispatch, hasCrossChainZap, forceSelection]);

  return { ctaLabel, openSelectStep };
}
