import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode } from 'react';
import type { VaultEntity } from '../../../../../features/data/entities/vault.ts';
import { ShareButton } from '../../../../../features/vault/components/ShareButton/ShareButton.tsx';
import { Title } from '../../Title/Title.tsx';
import { TransactionLink } from '../../TransactionLink/TransactionLink.tsx';
import { CloseAndResetButton } from '../common/CloseButton.tsx';
import { Buttons, Content, Message, MessageHighlight } from '../common/Common.tsx';

export type SuccessContentDisplayProps = {
  title: string;
  message: ReactNode;
  messageHighlight?: ReactNode;
  rememberTitle?: string;
  rememberMessage?: ReactNode;
  shareVaultId?: VaultEntity['id'];
};

export const SuccessContentDisplay = memo(function SuccessContentDisplay({
  title,
  message,
  messageHighlight,
  rememberTitle,
  rememberMessage,
  shareVaultId,
}: SuccessContentDisplayProps) {
  return (
    <>
      <Title text={title} />
      <Content variant="success">
        <Message>{message}</Message>
        {messageHighlight ?
          <MessageHighlight>{messageHighlight}</MessageHighlight>
        : null}
        <TransactionLink />
      </Content>
      {rememberTitle && rememberMessage ?
        <RememberContainer>
          <Message>
            <span>{rememberTitle}</span> {rememberMessage}
          </Message>
        </RememberContainer>
      : null}
      <Buttons>
        {shareVaultId ?
          <ShareButton vaultId={shareVaultId} placement="bottom-start" />
        : null}
        <CloseAndResetButton />
      </Buttons>
    </>
  );
});

const RememberContainer = styled('div', {
  base: {
    marginTop: '16px',
  },
});
