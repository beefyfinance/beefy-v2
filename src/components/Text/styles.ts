import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  inherit: {},
  h1: theme.typography['h1'],
  h2: theme.typography['h2'],
  h3: theme.typography['h3'],
  'body-lg': theme.typography['body-lg'],
  'body-lg-med': theme.typography['body-lg-med'],
  'body-sm': theme.typography['body-sm'],
  'body-sm-med': theme.typography['body-sm-med'],
  'subline-lg': theme.typography['subline-lg'],
  'subline-sm': theme.typography['subline-sm'],
  noWrap: {
    whiteSpace: 'nowrap' as const,
  },
});
