import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';
import {
  selectStepperChainId,
  selectStepperCurrentStepData,
} from '../../../../features/data/selectors/stepper';
import { explorerTxUrl } from '../../../../helpers/url';
import { useMemo } from 'react';

const useStyles = makeStyles(styles);

export function TransactionLink() {
  const classes = useStyles();
  const { t } = useTranslation();

  const chainId = useAppSelector(selectStepperChainId);
  const step = useAppSelector(selectStepperCurrentStepData);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const chain = useAppSelector(state => selectChainById(state, chainId));

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  const txLink = useMemo(() => {
    if (hash) {
      if (step.extraInfo?.stargate) {
        return `https://layerzeroscan.com/tx/${hash}`;
      }
      return explorerTxUrl(chain, hash);
    }
  }, [hash, chain, step]);

  if (!hash || !txLink) {
    return null;
  }

  return (
    <Button className={classes.redirectLinkSuccess} href={txLink} target="_blank">
      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#4DB258" fontSize="inherit" />}
    </Button>
  );
}
