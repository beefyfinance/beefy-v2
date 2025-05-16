import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../../../data/actions/wallet/stepper.ts';
import { claimGovVault } from '../../../../../../../data/actions/wallet/gov.ts';
import type { VaultGov } from '../../../../../../../data/entities/vault.ts';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper.ts';
import { selectGovVaultById } from '../../../../../../../data/selectors/vaults.ts';
import { ActionConnectSwitch } from '../../../CommonActions/CommonActions.tsx';

type ClaimProps = {
  vaultId: VaultGov['id'];
};

export const Claim = memo(function Claim({ vaultId }: ClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));
  const isStepping = useAppSelector(selectIsStepperStepping);

  const handleClaim = useCallback(() => {
    dispatch(
      stepperStartWithSteps(
        [
          {
            step: 'claim-gov',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: claimGovVault(vault),
            pending: false,
          },
        ],
        vault.chainId
      )
    );
  }, [dispatch, vault, t]);

  return (
    <ActionConnectSwitch chainId={vault.chainId}>
      <Button fullWidth={true} variant="success" onClick={handleClaim} disabled={isStepping}>
        {t('Rewards-Claim-gov')}
      </Button>
    </ActionConnectSwitch>
  );
});
