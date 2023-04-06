import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  fullscreen: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
  },
  loader: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
  },
  image: {},
  text: {
    ...theme.typography['body-lg-med'],
  },
});
