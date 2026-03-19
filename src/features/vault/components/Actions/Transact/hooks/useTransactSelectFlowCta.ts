import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactVaultHasCrossChainZap,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

type Mode = 'deposit' | 'withdraw';

/**
 * Same navigation as TokenSelectButton: cross-chain + forceSelection → chain select, else token select.
 * Label mirrors DepositForm / WithdrawForm header logic.
 */
export function useTransactSelectFlowCta(mode: Mode) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);

  const ctaLabel = useMemo(() => {
    if (hasCrossChainZap && forceSelection) {
      return t('Transact-SelectChain');
    }
    if (hasOptions) {
      return t(forceSelection ? 'Transact-SelectToken' : 'Transact-SelectAmount');
    }
    return t(mode === 'deposit' ? 'Transact-Deposit' : 'Transact-Withdraw');
  }, [forceSelection, hasCrossChainZap, hasOptions, mode, t]);

  const openSelectStep = useCallback(() => {
    if (hasCrossChainZap && forceSelection) {
      dispatch(transactSwitchStep(TransactStep.ChainSelect));
    } else {
      dispatch(transactSwitchStep(TransactStep.TokenSelect));
    }
  }, [dispatch, hasCrossChainZap, forceSelection]);

  return { ctaLabel, openSelectStep };
}
