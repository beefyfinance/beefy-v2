import { styled } from '@repo/styles/jsx';
import { memo, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

export type MessageProps = PropsWithChildren<{
  title: string;
  text: string;
  textParams?: Record<string, string | number>;
}>;

export const Message = memo(function Message({ title, text, textParams, children }: MessageProps) {
  const { t } = useTranslation();

  return (
    <MessageContainer>
      <Title>{t(title)}</Title>
      <Text>{t(text, textParams)}</Text>
      {children ?
        <Extra>{children}</Extra>
      : null}
    </MessageContainer>
  );
});

export const MessageContainer = styled('div', {
  base: {
    padding: '24px',
    background: 'background.content',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'h3',
    color: 'text.middle',
    margin: '0 0 4px 0',
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.middle',
  },
});

const Extra = styled('div', {
  base: {
    marginTop: '24px',
  },
});
