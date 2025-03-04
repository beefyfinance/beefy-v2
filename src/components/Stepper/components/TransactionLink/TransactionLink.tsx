import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useTranslation } from 'react-i18next';
import OpenInNewRoundedIcon from '../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectStepperChainId } from '../../../../features/data/selectors/stepper.ts';
import { explorerTxUrl } from '../../../../helpers/url.ts';

const useStyles = legacyMakeStyles(styles);

export function TransactionLink() {
  const classes = useStyles();
  const { t } = useTranslation();
  const chainId = useAppSelector(selectStepperChainId);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const chain = useAppSelector(state => (chainId ? selectChainById(state, chainId) : undefined));

  if (!chain) {
    return null;
  }

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
    <a className={classes.redirectLinkSuccess} href={explorerTxUrl(chain, hash)} target="_blank">
      {t('Transactn-View')} {<OpenInNewRoundedIcon color="#4DB258" fontSize="inherit" />}
    </a>
  );
}
