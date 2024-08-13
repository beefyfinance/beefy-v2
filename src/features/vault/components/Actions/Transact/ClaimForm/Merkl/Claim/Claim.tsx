import { memo, useCallback, useEffect, useState } from 'react';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../CommonActions';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store';
import { walletActions } from '../../../../../../../data/actions/wallet-actions';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper';
import { selectFetchMerklRewardsLastDispatched } from '../../../../../../../data/selectors/data-loader';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectChainById } from '../../../../../../../data/selectors/chains';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper';
import { TenderlyMerklClaimButton } from '../../../../../../../../components/Tenderly/Buttons/TenderlyMerklClaimButton';
import { TimeCountdown } from '../../TimeCountdown/TimeCountdown';

const useStyles = makeStyles(styles);
const MERKL_MIN_TIME_BETWEEN_REQUESTS_MS = 15_000;

type ClaimProps = {
  chainId: ChainEntity['id'];
  withChain?: boolean;
};

export const Claim = memo<ClaimProps>(function Claim({ chainId, withChain }) {
  const classes = useStyles();
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
          className={classes.claim}
        >
          {!isStepping && shouldWait ? (
            <TimeCountdown until={lastDispatched + MERKL_MIN_TIME_BETWEEN_REQUESTS_MS} />
          ) : (
            t(withChain ? 'Rewards-Claim-merkl-chain' : 'Rewards-Claim-merkl', {
              chain: chain.name,
            })
          )}
        </Button>
      </ActionConnectSwitch>
      {import.meta.env.DEV ? (
        <TenderlyMerklClaimButton chainId={chainId} disabled={disable} />
      ) : null}
    </>
  );
});
