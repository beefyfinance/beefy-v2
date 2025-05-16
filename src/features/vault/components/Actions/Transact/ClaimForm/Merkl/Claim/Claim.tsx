import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button/Button.tsx';
import { TenderlyMerklClaimButton } from '../../../../../../../../components/Tenderly/Buttons/TenderlyMerklClaimButton.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../../../data/actions/wallet/stepper.ts';
import { claimMerkl } from '../../../../../../../data/actions/wallet/offchain.ts';
import type { ChainEntity } from '../../../../../../../data/entities/chain.ts';
import { selectChainById } from '../../../../../../../data/selectors/chains.ts';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper.ts';
import { selectFetchMerklRewardsLastDispatched } from '../../../../../../../data/selectors/user-rewards.ts';
import { ActionConnectSwitch } from '../../../CommonActions/CommonActions.tsx';
import { TimeCountdown } from '../../TimeCountdown/TimeCountdown.tsx';
import { styles } from './styles.ts';

const MERKL_MIN_TIME_BETWEEN_REQUESTS_MS = 15000;

type ClaimProps = {
  chainId: ChainEntity['id'];
  withChain?: boolean;
};

export const Claim = memo(function Claim({ chainId, withChain }: ClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const lastDispatched = useAppSelector(selectFetchMerklRewardsLastDispatched);
  const [shouldWait, setShouldWait] = useState(
    () => Date.now() - lastDispatched < MERKL_MIN_TIME_BETWEEN_REQUESTS_MS
  );
  const isStepping = useAppSelector(selectIsStepperStepping);
  const disable = isStepping || shouldWait;
  const handleClaim = useCallback(() => {
    dispatch(
      stepperStartWithSteps(
        [
          {
            step: 'claim-rewards',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: claimMerkl(chainId),
            pending: false,
          },
        ],
        chainId
      )
    );
  }, [dispatch, chainId, t]);

  useEffect(() => {
    const msLeft = lastDispatched + MERKL_MIN_TIME_BETWEEN_REQUESTS_MS - Date.now();
    if (msLeft > 0) {
      setShouldWait(true);
      const id = setTimeout(() => {
        setShouldWait(false);
      }, msLeft);
      return () => clearTimeout(id);
    }
  }, [lastDispatched, setShouldWait]);

  return (
    <>
      <ActionConnectSwitch chainId={chainId}>
        <Button
          fullWidth={true}
          variant="success"
          onClick={handleClaim}
          disabled={disable}
          css={styles.claim}
        >
          {!isStepping && shouldWait ?
            <TimeCountdown until={lastDispatched + MERKL_MIN_TIME_BETWEEN_REQUESTS_MS} />
          : t(withChain ? 'Rewards-Claim-merkl-chain' : 'Rewards-Claim-merkl', {
              chain: chain.name,
            })
          }
        </Button>
      </ActionConnectSwitch>
      {import.meta.env.DEV ?
        <TenderlyMerklClaimButton chainId={chainId} disabled={disable} />
      : null}
    </>
  );
});
