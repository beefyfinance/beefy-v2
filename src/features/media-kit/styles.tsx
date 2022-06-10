import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  headerBox: {
    display: 'flex',
    alignItems: 'center',
    margin: '40px 0 0 0',
  },
  logo: {
    height: '48px',
    width: 'auto',
    marginRight: '12px',
  },
  headerTitle: {
    ...theme.typography['h1'],
    margin: 0,
  },
});
