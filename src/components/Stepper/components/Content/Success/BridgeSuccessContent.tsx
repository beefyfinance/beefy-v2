import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../../features/data/selectors/chains.ts';
import { selectBridgeSuccess } from '../../../../../features/data/selectors/stepper.ts';
import type { BridgeAdditionalData } from '../../../../../features/data/reducers/wallet/wallet-action-types.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { explorerTxUrl } from '../../../../../helpers/url.ts';
import { ExternalLink } from '../../../../Links/ExternalLink.tsx';
import { Title } from '../../Title/Title.tsx';
import { CloseAndResetButton } from '../common/CloseButton.tsx';
import { Buttons, Content, Message, MessageHighlight } from '../common/Common.tsx';
import type { SuccessContentProps } from './types.ts';

export const BridgeSuccessContent = memo<SuccessContentProps>(function BridgeSuccessContent() {
  const { t } = useTranslation();
  const walletAction = useAppSelector(selectBridgeSuccess);
  const { hash } = walletAction.data;
  const { quote } = walletAction.additional as BridgeAdditionalData;
  const bridgeExplorerUrl = quote.config.explorerUrl;
  const fromChain = useAppSelector(state => selectChainById(state, quote.input.token.chainId));
  const toChain = useAppSelector(state => selectChainById(state, quote.output.token.chainId));
  const explorerUrl = useMemo(() => {
    if (bridgeExplorerUrl) {
      return bridgeExplorerUrl.replace('{{hash}}', hash);
    }
    return explorerTxUrl(fromChain, hash);
  }, [fromChain, hash, bridgeExplorerUrl]);

  return (
    <>
      <Title text={t('Stepper-bridge-Success-Title')} />
      <Content variant="success">
        <Message>{t('Stepper-bridge-Success-Content', { from: fromChain.name })}</Message>
        <MessageHighlight>
          <Trans
            t={t}
            i18nKey={
              bridgeExplorerUrl ?
                'Stepper-bridge-Success-Track-Incoming'
              : 'Stepper-bridge-Success-Track-Outgoing'
            }
            components={{
              Link: <TrackingLink href={explorerUrl} />,
            }}
            values={{ to: toChain.name, from: fromChain.name, provider: quote.config.title }}
          />
        </MessageHighlight>
      </Content>
      <Buttons>
        <CloseAndResetButton />
      </Buttons>
    </>
  );
});

const TrackingLink = styled(ExternalLink, {
  base: {
    textDecoration: 'none',
    color: 'green.80-40',
  },
});
