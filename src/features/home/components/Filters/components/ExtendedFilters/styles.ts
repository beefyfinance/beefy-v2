import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  dropdown: {
    width: '350px',
    maxWidth: 'calc(100% - 32px)',
    zIndex: 1000,
  },
  dropdownInner: {
    backgroundColor: '#303550',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0px 4px 24px 24px rgba(19, 17, 34, 0.16), 0px 2px 8px rgba(20, 18, 33, 0.2)',
  },
  sidebar: {
    backgroundColor: '#303550',
    width: '350px',
    maxWidth: 'calc(100vw - 32px)',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    boxShadow: '0px 4px 24px 24px rgba(19, 17, 34, 0.16), 0px 2px 8px rgba(19, 17, 34, 0.2)',
  },
  sidebarHeader: {
    ...theme.typography['h2'],
    backgroundColor: '#111321',
    color: '#F5F5FF',
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
    color: '#999CB3',
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
    color: '#F5F5FF',
  },
  shownVaultsCount: {
    width: '100%',
  },
  checkbox: {
    width: '100%',
    marginTop: '16px',
    '& + $select': {
      marginTop: '24px',
    },
  },
  select: {
    width: '100%',
    marginTop: '16px',
  },
});
