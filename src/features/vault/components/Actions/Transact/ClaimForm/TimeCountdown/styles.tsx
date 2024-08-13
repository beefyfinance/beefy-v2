import type { Theme } from '@material-ui/core';
import { theme } from '../../../../../../../theme';

export const styles = (_theme: Theme) => ({
  timer: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    position: 'relative' as const,
    width: '100%',
    textAlign: 'center' as const,
    justifyContent: 'center',
    height: theme.typography['body-lg-med'].lineHeight,
  },
  icon: {
    position: 'absolute' as const,
    left: 0,
  },
});
