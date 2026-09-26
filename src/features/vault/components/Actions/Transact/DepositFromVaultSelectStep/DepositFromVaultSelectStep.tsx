import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { DepositFromVaultSelectList } from '../DepositFromVaultSelectList/DepositFromVaultSelectList.tsx';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import { DepositFromClmPositions } from './DepositFromClmPositions.tsx';

export const DepositFromVaultSelectStep = memo(function DepositFromVaultSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // a CLM held on several sides picks its position on a second screen
  const [openClmId, setOpenClmId] = useState<VaultEntity['id'] | undefined>(undefined);
  const clmName = useAppSelector(state =>
    openClmId ? selectVaultById(state, openClmId).names.list : undefined
  );

  const handleBack = useCallback(() => {
    if (openClmId) {
      setOpenClmId(undefined);
    } else {
      dispatch(transactSwitchStep(TransactStep.Form));
    }
  }, [dispatch, openClmId]);

  return (
    <div>
      <StepHeader onBack={handleBack}>{clmName ?? t('Transact-DepositFromVault-Title')}</StepHeader>
      {openClmId ?
        <DepositFromClmPositions clmId={openClmId} />
      : <DepositFromVaultSelectList onOpenClm={setOpenClmId} />}
    </div>
  );
});
