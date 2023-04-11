import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    ...theme.typography['body-lg-med'],
    position: 'relative' as const,
    color: '#D0D0DA',
    background: '#111321',
    padding: '16px 24px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    '&::after': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      background: '#363B63',
    },
  },
  backLink: {
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    columnGap: '12px',
    cursor: 'pointer',
  },
  backButton: {
    margin: 0,
    padding: 0,
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: '#363B63',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
  },
  backIcon: {
    fill: '#F5F5FF',
    width: '12px',
    height: '9px',
  },
});
