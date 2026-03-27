import { css } from '@repo/styles/css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import {
  selectStepperBridgeStatus,
  selectStepperChainId,
} from '../../../../features/data/selectors/stepper.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { explorerTxUrl } from '../../../../helpers/url.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import OpenInNewRoundedIcon from '../../../../images/icons/mui/OpenInNewRounded.svg?react';
import { styles } from './styles.ts';
import { ExternalLink } from '../../../Links/ExternalLink.tsx';

const useStyles = legacyMakeStyles(styles);

export function TransactionLink() {
  const classes = useStyles();
  const { t } = useTranslation();
  const chainId = useAppSelector(selectStepperChainId);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const srcChain = useAppSelector(state => (chainId ? selectChainById(state, chainId) : undefined));
  const destChain = useAppSelector(state =>
    bridgeStatus?.destChainId ? selectChainById(state, bridgeStatus.destChainId) : undefined
  );

  const linkInfo = useMemo(() => {
    if (bridgeStatus?.dstTxHash && destChain) {
      return { chain: destChain, hash: bridgeStatus.dstTxHash };
    }

    const hash =
      walletActionsState.result === 'success' ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending' ? walletActionsState.data.hash
      : '';

    if (hash && srcChain) {
      return { chain: srcChain, hash };
    }

    return undefined;
  }, [bridgeStatus, destChain, walletActionsState, srcChain]);

  if (!linkInfo) {
    return null;
  }

  return (
    <ExternalLink
      className={classes.redirectLinkSuccess}
      href={explorerTxUrl(linkInfo.chain, linkInfo.hash)}
    >
      {t('Transactn-View')} <OpenInNewRoundedIcon className={css({ fontSize: '16px' })} />
    </ExternalLink>
  );
}
