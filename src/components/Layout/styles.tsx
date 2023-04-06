import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.background.appBG,
  },
  top: {
    flex: '0 0 auto',
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
});
