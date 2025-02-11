import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 2px ${theme.palette.background.contentDark}`,
    borderRadius: '8px',
    marginTop: '4px',
    minWidth: '280px',
    zIndex: 999,
  },
  header: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${12 - 2}px`,
    backgroundColor: theme.palette.background.contentDark,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
      margin: '0px 4px',
    },
  },
  cross: {
    color: theme.palette.text.dark,
    '&:hover': {
      color: theme.palette.text.light,
      cursor: 'pointer',
    },
  },
  content: {
    height: '362px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
  },
  list: {
    padding: `${12 - 2}px`,
    height: '100%',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
    backgroundColor: theme.palette.background.contentLight,
    padding: `${12 - 2}px`,
    borderRadius: '0 0 8px 8px',
  },
  flexGrow: {
    flewGrow: 1,
  },
  edit: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: `${12 - 2}px`,
    rowGap: '16px',
  },
  chainInfo: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    columnGap: '8px',
    color: theme.palette.text.middle,
  },
  input: {
    color: theme.palette.text.dark,
    background: theme.palette.background.searchInputBg,
    borderRadius: '8px',
    '& .MuiInputBase-input': {
      padding: '8px 16px',
      color: theme.palette.text.dark,
      height: 'auto',
      '&:focus': {
        color: theme.palette.text.light,
      },
      '&::placeholder': {
        color: theme.palette.text.dark,
        opacity: 1,
      },
    },
  },
  listItemIcon: {
    marginRight: '8px',
  },
  modifiedListItem: {
    ...theme.typography['body-lg'],
    display: 'flex',
    gap: '8px',
    color: theme.palette.text.light,
  },
  url: {
    ...theme.typography['body-sm'],
    marginLeft: '32px',
    color: theme.palette.text.dark,
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
});
