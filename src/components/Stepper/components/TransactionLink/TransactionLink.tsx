import { css } from '@repo/styles/css';
import { useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { selectStepperChainId } from '../../../../features/data/selectors/stepper.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { explorerTxUrl } from '../../../../helpers/url.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import OpenInNewRoundedIcon from '../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { styles } from './styles.ts';

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
    walletActionsState.result === 'success' ? walletActionsState.data.receipt.transactionHash
    : walletActionsState.result === 'success_pending' ? walletActionsState.data.hash
    : '';

  if (!hash) {
    return null;
  }

  return (
    <a className={classes.redirectLinkSuccess} href={explorerTxUrl(chain, hash)} target="_blank">
      {t('Transactn-View')} <OpenInNewRoundedIcon className={css({ fontSize: '16px' })} />
    </a>
  );
}
