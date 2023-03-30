import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  stat: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    textAlign: 'right' as const,
  },
  textLeft: {
    textAlign: 'left' as const,
  },
  textRed: {
    color: '#D15347',
  },
  textGreen: {
    color: theme.palette.primary.main,
  },
});
