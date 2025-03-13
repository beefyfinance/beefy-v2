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
      backgroundColor: 'alertBaseBackground',
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
          backgroundColor: 'alert.warning.background',
        },
        icon: {
          fill: 'alert.warning.icon',
        },
      },
      error: {
        alert: {
          backgroundColor: 'alert.error.background',
        },
        icon: {
          fill: 'alert.error.icon',
        },
      },
      info: {
        alert: {
          backgroundColor: 'alert.info.background',
        },
        icon: {
          fill: 'alert.info.icon',
        },
      },
    },
  },
});

export type AlertRecipe = typeof alertRecipe;
