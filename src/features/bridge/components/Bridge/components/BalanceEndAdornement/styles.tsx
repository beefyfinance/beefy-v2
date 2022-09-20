import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  balance: {
    marginLeft: 'auto',
    ...theme.typography['body-lg'],
    color: theme.palette.text.disabled,
  },
});
