import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
  },
  text: {
    marginTop: '24px',
  },
  input: {
    order: 1,
  },
  switcher: {
    margin: '12px 0',
    order: 2,
  },
  output: {
    order: 3,
  },
  continue: {
    marginTop: 'auto',
    order: 4,
  },
});
