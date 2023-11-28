import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  dropdown: {
    width: '350px',
    maxWidth: 'calc(100% - 32px)',
    zIndex: 1000,
  },
  dropdownInner: {
    backgroundColor: theme.palette.background.contentPrimary,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0px 4px 24px 24px rgba(19, 17, 34, 0.16), 0px 2px 8px rgba(20, 18, 33, 0.2)',
  },
  sidebar: {
    backgroundColor: theme.palette.background.contentPrimary,
    width: '350px',
    maxWidth: 'calc(100vw - 32px)',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    boxShadow: '0px 4px 24px 24px rgba(19, 17, 34, 0.16), 0px 2px 8px rgba(19, 17, 34, 0.2)',
  },
  sidebarHeader: {
    ...theme.typography['h2'],
    backgroundColor: theme.palette.background.contentDark,
    color: theme.palette.text.light,
    padding: '24px',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  sidebarHeaderTitle: {
    marginRight: '24px',
  },
  sidebarHeaderClose: {
    marginLeft: 'auto',
    padding: 0,
    border: 0,
    boxShadow: 'none',
    background: 'transparent',
    color: theme.palette.text.dark,
    cursor: 'pointer',
  },
  sidebarMain: {
    padding: '24px',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
  },
  sidebarFooter: {
    padding: '24px',
    flexGrow: 0,
    flexShrink: 0,
  },
  extendedFilters: {
    color: theme.palette.text.light,
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
  shownVaultsCount: {
    width: '100%',
  },
  checkbox: {
    width: '100%',
  },
  select: {
    width: '100%',
    marginTop: '16px',
  },
  selector: {
    backgroundColor: theme.palette.background.contentLight,
    border: '0',
  },
});
