import { memo, useCallback, useEffect, useState } from 'react';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../CommonActions';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store';
import { walletActions } from '../../../../../../../data/actions/wallet-actions';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper';
import { selectFetchStellaSwapRewardsLastDispatched } from '../../../../../../../data/selectors/data-loader';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectChainById } from '../../../../../../../data/selectors/chains';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper';
import type { VaultEntity } from '../../../../../../../data/entities/vault';
import { TenderlyStellaSwapClaimButton } from '../../../../../../../../components/Tenderly/Buttons/TenderlyStellaSwapClaimButton';
import { TimeCountdown } from '../../TimeCountdown/TimeCountdown';

const useStyles = makeStyles(styles);
const STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS = 5_000;

type ClaimProps = {
  chainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  withChain?: boolean;
};

export const Claim = memo<ClaimProps>(function Claim({ chainId, vaultId, withChain }) {
  const classes = useStyles();
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
      startStepperWithSteps(
        [
          {
            step: 'claim-rewards',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimStellaSwap(chainId, vaultId),
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
          className={classes.claim}
        >
          {!isStepping && shouldWait ? (
            <TimeCountdown until={lastDispatched + STELLA_SWAP_MIN_TIME_BETWEEN_REQUESTS_MS} />
          ) : (
            t(withChain ? 'Rewards-Claim-stellaswap-chain' : 'Rewards-Claim-stellaswap', {
              chain: chain.name,
            })
          )}
        </Button>
      </ActionConnectSwitch>
      {import.meta.env.DEV ? (
        <TenderlyStellaSwapClaimButton vaultId={vaultId} chainId={chainId} disabled={disable} />
      ) : null}
    </>
  );
});
