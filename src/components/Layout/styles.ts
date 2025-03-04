import { sva } from '@repo/styles/css';

export const layoutRecipe = sva({
  slots: ['wrapper', 'top', 'middle', 'bottom'],
  base: {
    wrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'background.body',
    },
    top: {
      flex: '0 0 auto',
      backgroundColor: 'background.header',
    },
    middle: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
    },
    bottom: {
      flex: '0 0 auto',
    },
  },
});
