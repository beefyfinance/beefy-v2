import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  snackbar: {
    width: '408px',
    maxWidth: 'calc(100% - 16px)',
    maxHeight: 'calc(100% - 16px)',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'column' as const,
  },
  snackbarContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
  },
  contentContainer: {
    backgroundColor: theme.palette.background.snackbars.bg,
    borderRadius: '0 0 4px 4px',
    padding: '12px 16px',
    minHeight: 0,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'auto',
  },
});
