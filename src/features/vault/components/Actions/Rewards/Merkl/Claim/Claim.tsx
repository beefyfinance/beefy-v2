import { memo, useCallback } from 'react';
import type { ChainEntity } from '../../../../../../data/entities/chain';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../Transact/CommonActions';
import { useAppDispatch } from '../../../../../../../store';
import { walletActions } from '../../../../../../data/actions/wallet-actions';
import { stepperActions } from '../../../../../../data/reducers/wallet/stepper';
import { startStepper } from '../../../../../../data/actions/stepper';

type ClaimProps = {
  chainId: ChainEntity['id'];
};

export const Claim = memo<ClaimProps>(function Claim({ chainId }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClaim = useCallback(() => {
    dispatch(
      stepperActions.addStep({
        step: {
          step: 'claim-rewards',
          message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
          action: walletActions.claimMerkl(chainId),
          pending: false,
        },
      })
    );

    dispatch(startStepper(chainId));
  }, [dispatch, chainId, t]);

  return (
    <ActionConnectSwitch chainId={chainId}>
      <Button fullWidth={true} variant="success" onClick={handleClaim}>
        {t('Rewards-Claim')}
      </Button>
    </ActionConnectSwitch>
  );
});
