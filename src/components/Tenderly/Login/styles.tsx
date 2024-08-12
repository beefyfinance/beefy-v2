import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  field: {},
  label: {
    ...theme.typography['subline-sm'],
    lineHeight: '1em',
  },
  inputHolder: {},
  inputHelpHolder: {
    background: theme.palette.background.contentLight,
    borderRadius: '8px',
  },
  input: {
    ...theme.typography['body-lg'],
    lineHeight: '20px',
    background: theme.palette.background.searchInputBg,
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    padding: '12px 48px 12px 16px',
    color: theme.palette.text.light,
    height: 'auto',
  },
  help: {
    ...theme.typography['body-sm'],
    padding: '12px 16px',
    fontSize: '16px',
    alignItems: 'center',
    color: theme.palette.text.middle,
  },
  helpIcon: {
    width: 20,
    height: 20,
    display: 'block',
  },
  helpText: {
    flex: '1 1 auto',
  },
  helpLink: {},
  helpLinkIcon: {
    width: 16,
    height: 16,
    display: 'block',
  },
  helpLinkAnchor: {
    display: 'flex',
  },
});
