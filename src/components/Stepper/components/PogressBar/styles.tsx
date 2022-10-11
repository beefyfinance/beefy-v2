import { Theme } from '@material-ui/core/styles';

const baseProgressBar = {
  margin: 0,
  height: '100%',
  transitionTimingFunction: 'ease-in',
  transition: '0.3s',
  backgroundColor: '#59A662',
};

export const styles = (theme: Theme) => ({
  topBar: {
    height: '10px',
    borderRadius: '4px 4px 0 0',
    backgroundColor: theme.palette.background.snackbars.bgLine,
    flexShrink: 0,
    flexGrow: 0,
  },
  progressBar: {
    ...baseProgressBar,
    width: props => `${props.progress}%`,
    borderRadius: '4px 0 0 0',
    backgroundColor: theme.palette.primary.main,
  },
  errorBar: {
    ...baseProgressBar,
    width: '100%',
    backgroundColor: theme.palette.background.snackbars.error,
    borderRadius: '4px 4px 0 0',
  },
  successBar: {
    ...baseProgressBar,
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px 4px 0 0',
  },
});
