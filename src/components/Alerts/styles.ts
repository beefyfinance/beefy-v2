import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  alert: {
    display: 'flex',
    flexDirection: 'row' as const,
    columnGap: '8px',
    minWidth: 0,
    width: '100%',
    borderRadius: '8px',
    padding: '16px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 245, 255, 0.08)',
  },
  icon: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
    flexGrow: 0,
  },
  content: {
    ...theme.typography['body-lg'],
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    color: '#D0D0DA',
    wordBreak: 'break-word' as const,
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  warning: {
    backgroundColor: 'rgba(209, 152, 71, 0.15)',
    '& $icon': {
      fill: '#D19847',
    },
  },
  error: {
    backgroundColor: 'rgba(209, 83, 71, 0.15)',
    '& $icon': {
      fill: '#D15347',
    },
  },
});
