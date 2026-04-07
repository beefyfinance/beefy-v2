import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactMode,
  selectTransactSelectedChainId,
  selectTransactVaultHasCrossChainZap,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import { DepositTokenSelectList } from '../TokenSelectList/DepositTokenSelectList.tsx';
import { WithdrawTokenSelectList } from '../TokenSelectList/WithdrawTokenSelectList.tsx';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';

export const TokenSelectStep = memo(function TokenSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const mode = useAppSelector(selectTransactMode);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);
  const backStep = hasCrossChainZap ? TransactStep.ChainSelect : TransactStep.Form;
  const transactChainId = useAppSelector(selectTransactSelectedChainId);

  const selectedChainId = transactChainId ?? vault.chainId;

  const handleBack = useCallback(() => {
    dispatch(transactSwitchStep(backStep));
  }, [dispatch, backStep]);

  return (
    <div>
      <StepHeader onBack={handleBack}>
        <TitleWithIcon>
          {mode === TransactMode.Deposit ?
            t('Transact-SelectToken-Deposit')
          : t('Transact-SelectToken-Withdraw')}
          <ChainIcon chainId={selectedChainId} />
        </TitleWithIcon>
      </StepHeader>
      {mode === TransactMode.Deposit ?
        <DepositTokenSelectList />
      : <WithdrawTokenSelectList />}
    </div>
  );
});

const TitleWithIcon = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});
