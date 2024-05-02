import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {
    position: 'relative' as const,
    display: 'inline-block',
    padding: '0 8px 0 0',
  },
  highlight: {
    ...theme.typography['body-sm'],
    backgroundColor: theme.palette.background.tags.clm,
    color: theme.palette.text.light,
    padding: '0px 6px',
    borderRadius: '10px',
    height: '20px',
    position: 'absolute' as const,
    top: '-2px',
    right: '0',
    transform: 'translate(50%, -50%)',
    pointerEvents: 'none' as const,
    zIndex: 10,
  },
});
