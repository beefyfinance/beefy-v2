import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../../../components/Button';
import { ActionConnectSwitch } from '../../../CommonActions';
import { useAppDispatch, useAppSelector } from '../../../../../../../../store';
import { walletActions } from '../../../../../../../data/actions/wallet-actions';
import { startStepperWithSteps } from '../../../../../../../data/actions/stepper';
import { selectFetchMerklRewardsLastDispatched } from '../../../../../../../data/selectors/data-loader';
import { Timer } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectChainById } from '../../../../../../../data/selectors/chains';
import { selectIsStepperStepping } from '../../../../../../../data/selectors/stepper';

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
    <ActionConnectSwitch chainId={chainId}>
      <Button
        fullWidth={true}
        variant="success"
        onClick={handleClaim}
        disabled={isStepping || shouldWait}
        className={classes.claim}
      >
        {!isStepping && shouldWait ? (
          <TimeCountdown until={lastDispatched + MERKL_MIN_TIME_BETWEEN_REQUESTS_MS} />
        ) : (
          t(withChain ? 'Rewards-Claim-merkl-chain' : 'Rewards-Claim-merkl', { chain: chain.name })
        )}
      </Button>
    </ActionConnectSwitch>
  );
});

type TimeCountdownProps = {
  until: number;
};
const TimeCountdown = memo<TimeCountdownProps>(function TimeCountdown({ until }) {
  const classes = useStyles();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const start = Date.now();
      if (start < until) {
        const id = setInterval(() => {
          const left = (until - Date.now()) / 1000;
          if (ref.current) {
            if (left > 0) {
              ref.current.innerHTML = `${left > 10 ? left.toFixed(0) : left.toFixed(1)}s`;
            } else {
              clearInterval(id);
            }
          }
        }, 100);
        return () => clearInterval(id);
      } else {
        ref.current.innerHTML = '';
      }
    }
  }, [ref, until]);

  return (
    <div className={classes.timer}>
      <Timer height={16} className={classes.icon} />
      <div ref={ref} />
    </div>
  );
});
