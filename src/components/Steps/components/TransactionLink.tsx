import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { ChainEntity } from '../../../features/data/entities/chain';
import { selectChainById } from '../../../features/data/selectors/chains';
import { BeefyState } from '../../../redux-types';
import { styles } from '../styles';

const useStyles = makeStyles(styles as any);

export function TransactionLink({ chainId }: { chainId: ChainEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);
  const chain = useSelector((state: BeefyState) => selectChainById(state, chainId));

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  return (
    <Button
      className={classes.redirectBtnSuccess}
      href={chain.explorerUrl + '/tx/' + hash}
      target="_blank"
    >
      {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" />}
    </Button>
  );
}
