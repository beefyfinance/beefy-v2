import { sva } from '@repo/styles/css';

export const alertRecipe = sva({
  slots: ['alert', 'icon', 'content'],
  base: {
    alert: {
      display: 'flex',
      flexDirection: 'row',
      columnGap: '8px',
      minWidth: 0,
      width: '100%',
      borderRadius: '8px',
      padding: '16px',
      alignItems: 'flex-start',
      backgroundColor: 'extracted3438',
    },
    icon: {
      width: '24px',
      height: '24px',
      flexShrink: 0,
      flexGrow: 0,
    },
    content: {
      flexShrink: 1,
      flexGrow: 1,
      minWidth: 0,
      color: 'text.middle',
      wordBreak: 'break-word',
      '& a': {
        color: 'text.middle',
      },
      '& p:first-child': {
        marginTop: 0,
      },
      '& p:last-child': {
        marginBottom: 0,
      },
    },
  },
  variants: {
    variant: {
      warning: {
        alert: {
          backgroundColor: 'orangeWarningo14',
        },
        icon: {
          fill: 'alert.warning',
        },
      },
      error: {
        alert: {
          backgroundColor: 'extracted583',
        },
        icon: {
          fill: 'alert.error',
        },
      },
      info: {
        alert: {
          backgroundColor: 'cornflowero13',
        },
        icon: {
          fill: 'alert.info',
        },
      },
    },
  },
});

export type AlertRecipe = typeof alertRecipe;
