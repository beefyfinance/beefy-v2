import { memo, useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { Modal } from '../../../Modal/Modal.tsx';
import { Button } from '../../../Button/Button.tsx';
import { CopyText } from '../../../CopyText/CopyText.tsx';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectIsWalletConnected } from '../../../../features/data/selectors/wallet.ts';
import { askForWalletConnection } from '../../../../features/data/actions/wallet.ts';
import { getWalletConnectionApi } from '../../../../features/data/apis/instances.ts';

type SignMessageModalProps = {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
};

export const SignMessageModal = memo<SignMessageModalProps>(function SignMessageModal({
  open,
  onClose,
  initialMessage = '',
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const [message, setMessage] = useState(initialMessage);
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update message when initialMessage changes (e.g., from URL param)
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleConnect = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleSign = useCallback(async () => {
    if (!message.trim()) {
      setError(t('SignMessage-ErrorEmpty'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignature('');

    try {
      const walletApi = await getWalletConnectionApi();
      const client = await walletApi.getConnectedViemClient();
      const [account] = await client.getAddresses();
      const sig = await client.signMessage({
        account,
        message,
      });
      setSignature(sig);
    } catch (err) {
      console.error('Sign message error:', err);
      setError(err instanceof Error ? err.message : t('SignMessage-ErrorUnknown'));
    } finally {
      setIsLoading(false);
    }
  }, [message, t]);

  const handleMessageChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (signature !== '') {
        setSignature('');
        setIsCopied(false);
      }
      setMessage(e.target.value);
      setError(null);
    },
    [signature]
  );

  const handleCopySignature = useCallback(() => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }, [setIsCopied]);

  return (
    <Modal open={open} onClose={onClose}>
      <Container>
        <Title>{t('SignMessage-Title')}</Title>
        <Intro>{t('SignMessage-Intro')}</Intro>

        <Label>{t('SignMessage-MessageLabel')}</Label>
        <MessageInput
          value={message}
          onChange={handleMessageChange}
          placeholder={t('SignMessage-MessagePlaceholder')}
          rows={4}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <Label>{t('SignMessage-SignatureLabel')}</Label>
        {signature ?
          <CopyText value={signature} onSuccess={handleCopySignature} />
        : <SignaturePlaceholder>{t('SignMessage-SignaturePlaceholder')}</SignaturePlaceholder>}

        {isCopied ?
          <CopiedText>{t('SignMessage-Copied')}</CopiedText>
        : null}

        {isWalletConnected ?
          <SignButton
            variant="cta"
            fullWidth={true}
            borderless={true}
            onClick={() => void handleSign()}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? t('SignMessage-Signing') : t('SignMessage-Sign')}
          </SignButton>
        : <SignButton variant="cta" fullWidth={true} borderless={true} onClick={handleConnect}>
            {t('Network-ConnectWallet')}
          </SignButton>
        }
      </Container>
    </Modal>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    backgroundColor: 'background.cardBody',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    minWidth: '320px',
  },
});

const Title = styled('h2', {
  base: {
    textStyle: 'h2',
    color: 'text.light',
    margin: '0',
  },
});

const Intro = styled('p', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    margin: '0',
  },
});

const Label = styled('label', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    textTransform: 'uppercase',
  },
});

const MessageInput = styled('textarea', {
  base: {
    backgroundColor: 'purpleDarkest',
    color: 'text.light',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    textStyle: 'body.medium',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    '&::placeholder': {
      color: 'white.70-64a',
    },
    _focus: {
      outline: '1px solid {colors.text.dark}',
    },
  },
});

const SignaturePlaceholder = styled('div', {
  base: {
    lineHeight: '20px',
    background: 'searchInput.background',
    borderRadius: '8px',
    width: '100%',
    padding: '12px 48px 12px 16px',
    color: 'white.70-64a',
  },
});

const SignButton = styled(Button, {
  base: {
    marginTop: '8px',
  },
});

const ErrorText = styled('p', {
  base: {
    textStyle: 'body.sm',
    color: 'indicators.error',
    margin: '0',
  },
});

const CopiedText = styled('p', {
  base: {
    textStyle: 'body.sm',
    color: 'green.40',
    margin: '0',
    animation: 'fadeInOut 1s ease-in-out forwards',
  },
});
