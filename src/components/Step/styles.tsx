import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    background: theme.palette.background.v2.contentPrimary,
    borderRadius: '12px',
    width: '100%',
    height: props => props.cardHeight,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  titleBar: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    background: theme.palette.background.v2.cardHeader,
    padding: '24px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottom: `solid 2px ${theme.palette.background.v2.border}`,
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    padding: 0,
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: theme.palette.background.v2.border,
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    color: theme.palette.text.primary,
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fill: theme.palette.text.primary,
    width: '12px',
    height: '9px',
  },
  adornment: {
    marginLeft: 'auto',
  },
  tokenIcon: {
    flexShrink: 0,
    flexGrow: 0,
    marginRight: '8px',
  },
  content: {
    padding: '24px',
    height: '462px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
  },
  noPadding: {
    padding: 0,
  },
});
