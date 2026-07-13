import { styled } from '@repo/styles/jsx';
import { memo, type PropsWithChildren, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type MessageProps = PropsWithChildren<{
  title: string;
  text?: string;
  textParams?: Record<string, string | number>;
  /** rendered in the text slot; `children` go in the spaced action zone below */
  body?: ReactNode;
}>;

export const Message = memo(function Message({
  title,
  text,
  textParams,
  body,
  children,
}: MessageProps) {
  const { t } = useTranslation();

  return (
    <MessageContainer>
      <Title>{t(title)}</Title>
      {text ?
        <Text>{t(text, textParams)}</Text>
      : null}
      {body}
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
