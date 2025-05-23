import { css } from '@repo/styles/css';

export const styles = {
  dropdown: css.raw({
    width: '350px',
    maxWidth: 'calc(100% - 32px)',
    zIndex: 'dropdown',
  }),
  dropdownInner: css.raw({
    backgroundColor: 'background.content',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0px 4px 24px 24px filtersBoxShadowTransparent, 0px 2px 8px filtersBoxShadowSolid',
  }),
  sidebar: css.raw({
    backgroundColor: 'background.content',
    width: '350px',
    maxWidth: 'calc(100vw - 32px)',
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    boxShadow: '0px 4px 24px 24px filtersBoxShadowTransparent, 0px 2px 8px filtersBoxShadowSolid',
  }),
  sidebarHeader: css.raw({
    textStyle: 'h2',
    backgroundColor: 'background.content.dark',
    color: 'text.light',
    padding: '24px',
    flexGrow: '0',
    flexShrink: '0',
    display: 'flex',
    alignItems: 'center',
  }),
  sidebarHeaderTitle: css.raw({
    marginRight: '24px',
  }),
  sidebarHeaderClose: css.raw({
    marginLeft: 'auto',
    padding: '0',
    border: '0',
    boxShadow: 'none',
    background: 'transparent',
    color: 'text.dark',
    cursor: 'pointer',
  }),
  sidebarMain: css.raw({
    padding: '24px',
    flexGrow: '1',
    flexShrink: '1',
    minHeight: '0',
    overflowY: 'auto',
  }),
  sidebarFooter: css.raw({
    padding: '24px',
    flexGrow: '0',
    flexShrink: '0',
  }),
  select: css.raw({
    width: '100%',
    marginTop: '16px',
  }),
};
