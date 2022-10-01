import { Theme } from '@material-ui/core/styles';

const baseProgressBar = {
  margin: 0,
  height: '100%',
  borderRadius: '4px 0 0 0',
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
  progressBar25: {
    ...baseProgressBar,
    width: '25%',
  },
  progressBar50: {
    ...baseProgressBar,
    width: '50%',
  },
  progressBar60: {
    ...baseProgressBar,
    width: '60%',
  },
  progressBar70: {
    ...baseProgressBar,
    width: '70%',
  },
  progressBar75: {
    ...baseProgressBar,
    width: '75%',
  },
  progressBar80: {
    ...baseProgressBar,
    width: '80%',
  },
  progressBar90: {
    ...baseProgressBar,
    width: '90%',
  },
  successBar: {
    width: '100%',
    margin: 0,
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px 4px 0 0',
    transitionTimingFunction: 'ease-in',
    transition: '0.3s',
  },
  errorBar: {
    width: '100%',
    margin: 0,
    height: '100%',
    backgroundColor: theme.palette.background.snackbars.error,
    borderRadius: '4px 4px 0 0',
    transitionTimingFunction: 'ease-in',
    transition: '0.3s',
  },
});
