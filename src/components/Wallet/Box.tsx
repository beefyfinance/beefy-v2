import { styled } from '@repo/styles/jsx';

export const Box = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: 'var(--shadow-bg, {colors.background.content.dark})',
    borderRadius: '16px',
    flex: '1 1 auto',
    minHeight: 0,
    contain: 'paint',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  variants: {
    variant: {
      default: {
        '--shadow-bg': '{colors.background.content.dark}',
        color: 'text.light',
      },
      error: {
        '--shadow-bg': '{colors.indicators.error.bg}',
        color: 'indicators.error.fg',
      },
    },
    noPadding: {
      false: {
        padding: '12px 16px',
      },
    },
    align: {
      top: {
        justifyContent: 'flex-start',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    noPadding: false,
  },
});
