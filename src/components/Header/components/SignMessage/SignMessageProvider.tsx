import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { SignMessageModal } from './SignMessageModal.tsx';
import { SignMessageContext } from './sign-message-context.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectIsConfigAvailable } from '../../../../features/data/selectors/data-loader/config.ts';

function getMessageFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('message');
}

export const SignMessageProvider = memo<{ children: ReactNode }>(function SignMessageProvider({
  children,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isConfigLoaded = useAppSelector(selectIsConfigAvailable);
  const hasAutoOpened = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');

  const openModal = useCallback((message?: string) => {
    setInitialMessage(message || '');
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialMessage('');
    // Clear the message param from URL when closing
    if (searchParams.has('message')) {
      setSearchParams(
        prev => {
          prev.delete('message');
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  // Auto-open modal from URL param once config is loaded
  useEffect(() => {
    if (!isConfigLoaded || hasAutoOpened.current) return;

    const messageParam = getMessageFromUrl();
    if (messageParam !== null) {
      hasAutoOpened.current = true;
      openModal(messageParam);
    }
  }, [isConfigLoaded, openModal]);

  const contextValue = useMemo(() => ({ openModal }), [openModal]);

  return (
    <SignMessageContext.Provider value={contextValue}>
      {children}
      <SignMessageModal open={isOpen} onClose={closeModal} initialMessage={initialMessage} />
    </SignMessageContext.Provider>
  );
});
