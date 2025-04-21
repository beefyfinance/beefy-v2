import { styled } from '@repo/styles/jsx';

export const Notification = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '6px 24px 8px 24px',
    color: 'colorPalette.text',
    textStyle: 'body.medium',
    backgroundColor: 'colorPalette.background',
    textWrap: 'wrap balance',
  },
  variants: {
    background: {
      transparent: {
        colorPalette: 'notification.transparent',
      },
      solid: {
        colorPalette: 'notification.solid',
      },
    },
    radius: {
      sm: {
        borderRadius: '8px',
      },
      md: {
        borderRadius: '12px',
      },
      lg: {
        borderRadius: '16px',
      },
    },
    attached: {
      free: {},
      top: {
        borderBottomRadius: '0px',
      },
      bottom: {
        borderTopRadius: '0px',
      },
    },
    padding: {
      default: {},
      none: {
        padding: '0',
        sm: {
          padding: '0',
        },
      },
    },
    direction: {
      row: {
        flexDirection: 'row',
      },
      column: {
        flexDirection: 'column',
      },
    },
  },
  defaultVariants: {
    background: 'transparent',
    radius: 'sm',
    attached: 'free',
    direction: 'row',
  },
});
