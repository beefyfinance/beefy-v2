import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 8px',
    gap: '8px',
    color: theme.palette.text.middle,
    '&:hover': {
      cursor: 'pointer' as const,
      color: theme.palette.text.light,
    },
  },
  dropdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: theme.palette.background.contentPrimary,
    border: `solid 2px ${theme.palette.background.contentDark}`,
    borderRadius: '8px',
    marginTop: '4px',
    width: '280px',
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
    borderRadius: '8px 8px 0px 0px',
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
    height: '356px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
  },
  list: {
    padding: `${12 - 2}px`,
    height: '100%',
    width: '100%',
    color: theme.palette.text.light,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px',
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
    color: theme.palette.text.middle,
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
    ...theme.typography['body-lg-med'],
    display: 'flex',
    gap: '8px',
    color: theme.palette.text.middle,
  },
  url: {
    ...theme.typography['body-sm'],
    marginLeft: '32px',
    color: theme.palette.text.dark,
    width: '196px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textAlign: 'start' as const,
  },
  emptyTextContainer: {
    ...theme.typography['body-sm-med'],
    padding: '12px',
    backgroundColor: theme.palette.background.contentLight,
    borderRadius: '8px',
    color: theme.palette.text.middle,
  },
  emptyIcon: {
    height: '120px',
    width: '120px',
  },
  backIcon: {
    fill: theme.palette.text.light,
    width: '12px',
    height: '9px',
  },
  backButton: {
    margin: 0,
    padding: 0,
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: theme.palette.background.border,
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    color: theme.palette.text.light,
    flexShrink: 0,
    flexGrow: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    display: 'flex',
    alignItem: 'center',
    gap: '12px',
  },
  line: {
    height: '16px',
    width: '2px',
    borderRadius: '3px',
    backgroundColor: theme.palette.background.contentLight,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  inputError: {
    ...theme.typography['body-sm'],
    color: theme.palette.error.main,
    marginLeft: '16px',
    transition: 'ease-in-out 2s;',
  },
});
