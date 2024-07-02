import { memo, useCallback } from 'react';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../CommonActions';
import { useAppDispatch } from '../../../../../../../../store';
import { walletActions } from '../../../../../../../data/actions/wallet-actions';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper';

type ClaimProps = {
  chainId: ChainEntity['id'];
};

export const Claim = memo<ClaimProps>(function Claim({ chainId }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClaim = useCallback(() => {
    dispatch(
      startStepperWithSteps(
        [
          {
            step: 'claim-rewards',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimMerkl(chainId),
            pending: false,
          },
        ],
        chainId
      )
    );
  }, [dispatch, chainId, t]);

  return (
    <ActionConnectSwitch chainId={chainId}>
      <Button fullWidth={true} variant="success" onClick={handleClaim}>
        {t('Rewards-Claim')}
      </Button>
    </ActionConnectSwitch>
  );
});
