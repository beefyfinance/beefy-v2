import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  label: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    marginBottom: '8px',
  },
  error: {
    ...theme.typography['body-sm-med'],
    color: '#D15347',
    marginTop: '8px',
  },
});
