import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { Button } from '../../../../components/Button/Button.tsx';
import { CopyText } from '../../../../components/CopyText/CopyText.tsx';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { selectIsWalletConnected } from '../../../data/selectors/wallet.ts';
import { askForWalletConnection } from '../../../data/actions/wallet.ts';
import { getWalletConnectionApi } from '../../../data/apis/instances.ts';
import { useIsMounted } from '../../../../hooks/useIsMounted.ts';
import type { Address } from 'viem';
import { formatAddressShort } from '../../../../helpers/format.ts';

const MESSAGE_TO_SIGN = 'I verify the ownership of';

export const SignMessageCard = memo(function SignMessageCard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const [signature, setSignature] = useState<{ hash: string; address: Address } | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();

  const handleConnect = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleSign = useCallback(() => {
    const askForSignature = async () => {
      const walletApi = await getWalletConnectionApi();
      const client = await walletApi.getConnectedViemClient();
      const [account] = await client.getAddresses();
      return {
        address: account,
        hash: await client.signMessage({
          account,
          message: `${MESSAGE_TO_SIGN} ${account}`,
        }),
      };
    };

    setIsLoading(true);
    setSignature(undefined);
    askForSignature()
      .then(sig => {
        if (isMounted()) {
          setSignature(sig);
        }
      })
      .catch(err => {
        console.error('Sign message error:', err);
      })
      .finally(() => {
        if (isMounted()) {
          setIsLoading(false);
        }
      });
  }, [isMounted]);

  const handleReset = useCallback(() => {
    setSignature(undefined);
  }, []);

  const isSigned = !!signature;
  const step =
    isSigned ? 'copy'
    : isWalletConnected ? 'sign'
    : 'connect';

  return (
    <Container>
      <TitleBar>{t('SignMessage-Title')}</TitleBar>
      <Content>
        {step === 'connect' && (
          <>
            <PromptText>{t('SignMessage-Card-ConnectPrompt')}</PromptText>
            <Button variant="cta" fullWidth={true} borderless={true} onClick={handleConnect}>
              {t('Network-ConnectWallet')}
            </Button>
          </>
        )}

        {step === 'sign' && (
          <>
            <PromptText>{t('SignMessage-Card-SignPrompt')}</PromptText>
            <Button
              variant="cta"
              fullWidth={true}
              borderless={true}
              onClick={handleSign}
              disabled={isLoading}
            >
              {isLoading ? t('SignMessage-Signing') : t('SignMessage-Sign')}
            </Button>
          </>
        )}

        {step === 'copy' && signature && (
          <>
            <PromptText>
              {t('SignMessage-Card-CopyPrompt', { address: formatAddressShort(signature.address) })}
            </PromptText>
            <SignatureContainer>
              <SignedLabel>{t('SignMessage-Card-SignatureHash')}</SignedLabel>
              <CopyText value={signature.hash} />
            </SignatureContainer>
            <Button variant="cta" fullWidth={true} borderless={true} onClick={handleReset}>
              {t('SignMessage-Card-Reset')}
            </Button>
          </>
        )}
      </Content>
    </Container>
  );
});

const Container = styled('div', {
  base: {
    background: 'background.content',
    borderRadius: '24px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});

const TitleBar = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    background: 'background.content.dark',
    borderTopRadius: '24px',
    borderBottom: 'solid 2px {colors.bayOfMany}',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    padding: '24px',
  },
});

const Content = styled('div', {
  base: {
    padding: '20px 16px 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    mdDown: {
      padding: '20px 24px 24px 24px',
    },
  },
});

const PromptText = styled('div', {
  base: {
    textStyle: 'body.md',
    color: 'text.dark',
  },
});

const SignatureContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
});

const SignedLabel = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    textTransform: 'uppercase',
    letterSpacing: '0.08px',
  },
});
