import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';
import { selectStepperChainId } from '../../../../features/data/selectors/stepper';

const useStyles = makeStyles(styles);

export function TransactionLink() {
  const classes = useStyles();
  const { t } = useTranslation();

  const chainId = useAppSelector(selectStepperChainId);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const chain = useAppSelector(state => selectChainById(state, chainId));

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  if (!hash) {
    return null;
  }

  return (
    <Button
      className={classes.redirectLinkSuccess}
      href={chain.explorerUrl + '/tx/' + hash}
      target="_blank"
    >
      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" fontSize="inherit" />}
    </Button>
  );
}
