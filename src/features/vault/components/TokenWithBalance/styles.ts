import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  balanceContainer: {
    ...theme.typography['body-lg-bold'],
    color: theme.palette.text.primary,
  },
  sm: {
    ...theme.typography['body-sm-bold'],
  },
  assetCount: {},
});
