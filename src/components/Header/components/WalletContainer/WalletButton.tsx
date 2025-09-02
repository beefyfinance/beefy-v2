import { type ButtonHTMLAttributes, memo } from 'react';
import { StatLoader } from '../../../StatLoader/StatLoader.tsx';
import { token } from '@repo/styles/tokens';
import { styled } from '@repo/styles/jsx';

export type WalletButtonProps = {
  initializing: boolean;
  connected: boolean;
  known: boolean;
  error: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const WalletButton = memo(function WalletButton({
  initializing,
  connected,
  known,
  error,
  children,
  ...rest
}: WalletButtonProps) {
  return (
    <Button known={known} error={error} {...rest}>
      {initializing ?
        <Loading known={known} connected={connected} />
      : children}
    </Button>
  );
});

type LoadingProps = {
  known: boolean;
  connected: boolean;
};

const Loading = memo(function Loading({ known, connected }: LoadingProps) {
  const width =
    known ?
      connected ? 113
      : 85
    : 116;

  return (
    <StatLoader
      width={width}
      foregroundColor={token('colors.darkBlue.60')}
      backgroundColor={token('colors.darkBlue.50')}
    />
  );
});

const Button = styled('button', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '8px 16px',
    borderStyle: 'solid',
    borderWidth: '2px',
    textStyle: 'body.medium',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    height: '40px',
    gap: '8px',
  },
  variants: {
    known: {
      true: {
        color: 'text.light',
        backgroundColor: 'background.content.dark',
        _hover: {
          backgroundColor: 'background.content',
        },
      },
      false: {
        color: 'buttons.cta.color',
        borderColor: 'buttons.cta.border',
        backgroundColor: 'buttons.cta.background',
        _hover: {
          borderColor: 'buttons.cta.hover.border',
          backgroundColor: 'buttons.cta.hover.background',
        },
      },
    },
    error: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      known: true,
      error: true,
      css: {
        borderColor: 'orange.40-12',
      },
    },
    {
      known: true,
      error: false,
      css: {
        borderColor: 'green.80-40',
      },
    },
  ],
  defaultVariants: {
    known: false,
    error: false,
  },
});
