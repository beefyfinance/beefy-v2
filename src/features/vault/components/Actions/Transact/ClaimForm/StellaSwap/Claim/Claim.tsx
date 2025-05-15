import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button/Button.tsx';
import { TenderlyStellaSwapClaimButton } from '../../../../../../../../components/Tenderly/Buttons/TenderlyStellaSwapClaimButton.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../../../data/actions/wallet/stepper.ts';
import { claimStellaSwap } from '../../../../../../../data/actions/wallet/offchain.ts';
import type { ChainEntity } from '../../../../../../../data/entities/chain.ts';
import type { VaultEntity } from '../../../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../../../data/selectors/chains.ts';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper.ts';
import { selectFetchStellaSwapRewardsLastDispatched } from '../../../../../../../data/selectors/user-rewards.ts';
import { ActionConnectSwitch } from '../../../CommonActions/CommonActions.tsx';
import { TimeCountdown } from '../../TimeCountdown/TimeCountdown.tsx';
import { styles } from './styles.ts';

const STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS = 5000;

type ClaimProps = {
  chainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  withChain?: boolean;
};

export const Claim = memo(function Claim({ chainId, vaultId, withChain }: ClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const lastDispatched = useAppSelector(selectFetchStellaSwapRewardsLastDispatched);
  const [shouldWait, setShouldWait] = useState(
    () => Date.now() - lastDispatched < STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS
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
            action: claimStellaSwap(chainId, vaultId),
            pending: false,
          },
        ],
        chainId
      )
    );
  }, [dispatch, chainId, vaultId, t]);

  useEffect(() => {
    const msLeft = lastDispatched + STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS - Date.now();
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
            <TimeCountdown until={lastDispatched + STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS} />
          : t(withChain ? 'Rewards-Claim-stellaswap-chain' : 'Rewards-Claim-stellaswap', {
              chain: chain.name,
            })
          }
        </Button>
      </ActionConnectSwitch>
      {import.meta.env.DEV ?
        <TenderlyStellaSwapClaimButton vaultId={vaultId} chainId={chainId} disabled={disable} />
      : null}
    </>
  );
});
