import { css } from '@repo/styles/css';

export const styles = {
  cardHolder: css.raw({
    position: 'absolute',
    outline: 'none',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    smDown: {
      padding: '0',
    },
  }),
  card: css.raw({
    margin: '0',
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    width: '1000px',
    maxWidth: '100%',
  }),
  cardHeader: css.raw({
    display: 'flex',
    alignItems: 'center',
    padding: '18px 24px',
    background: 'background.content.dark',
    borderRadius: '10px 10px 0px 0px ',
    borderBottom: '2px solid {colors.bayOfMany}',
  }),
  cardIcon: css.raw({
    marginRight: '8px',
  }),
  cardTitle: css.raw({
    color: 'text.light',
    marginRight: 'auto',
  }),
  closeButton: css.raw({
    '&:hover': {
      background: 'none',
    },
  }),
  cardContent: css.raw({
    background: 'background.content',
    borderRadius: '0 0 12px 12px',
    padding: '24px',
    minHeight: '200px',
    flexShrink: '1',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  }),
};
