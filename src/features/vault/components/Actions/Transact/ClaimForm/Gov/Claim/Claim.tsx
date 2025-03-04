import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button/Button.tsx';
import { ActionConnectSwitch } from '../../../CommonActions/CommonActions.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store.ts';
import { walletActions } from '../../../../../../../data/actions/wallet-actions.ts';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper.ts';
import type { VaultGov } from '../../../../../../../data/entities/vault.ts';
import { selectGovVaultById } from '../../../../../../../data/selectors/vaults.ts';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper.ts';

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
      startStepperWithSteps(
        [
          {
            step: 'claim-gov',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimGovVault(vault),
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
