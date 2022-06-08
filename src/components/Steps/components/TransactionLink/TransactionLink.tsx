import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { ChainEntity } from '../../../../features/data/entities/chain';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

export function TransactionLink({ chainId }: { chainId: ChainEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const chain = useAppSelector(state => selectChainById(state, chainId));

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

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
