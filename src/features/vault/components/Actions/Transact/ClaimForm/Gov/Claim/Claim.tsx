import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../CommonActions';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store';
import { walletActions } from '../../../../../../../data/actions/wallet-actions';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper';
import type { VaultGov } from '../../../../../../../data/entities/vault';
import { selectGovVaultById } from '../../../../../../../data/selectors/vaults';

type ClaimProps = {
  vaultId: VaultGov['id'];
};

export const Claim = memo<ClaimProps>(function Claim({ vaultId }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));

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
      <Button fullWidth={true} variant="success" onClick={handleClaim}>
        {t('Rewards-Claim')}
      </Button>
    </ActionConnectSwitch>
  );
});
