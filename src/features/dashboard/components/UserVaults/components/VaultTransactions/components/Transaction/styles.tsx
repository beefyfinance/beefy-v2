import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  stat: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.middle,
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  textFlexStart: {
    justifyContent: 'flex-start',
  },
  textRed: {
    color: '#D15347',
  },
  textGreen: {
    color: theme.palette.primary.main,
  },
});
