import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    columnGap: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    padding: '0px 16px 0px 0px',
  }),

  circle: css.raw({
    width: '12px',
    height: '12px',
    borderRadius: '30px',
    '&.loading': {
      backgroundColor: 'indicators.loading',
    },
    '&.success': {
      backgroundColor: 'indicators.success',
    },
    '&.warning': {
      backgroundColor: 'indicators.warning',
    },
    position: 'relative',
  }),
  dropdown: css.raw({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '272px',
    padding: '0px',
    backgroundColor: 'background.content.light',
  }),
  titleContainer: css.raw({
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px 6px 12px',
    backgroundColor: 'inherit',
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
  }),
  title: css.raw({
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
      margin: '0px 4px',
    },
  }),
  cross: css.raw({
    color: 'text.dark',
    '&:hover': {
      color: 'text.light',
      cursor: 'pointer',
    },
  }),
  content: css.raw({
    padding: '10px',
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    marginInline: '2px',
  }),
  contentTitle: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'text.dark',
  }),
  contentDetail: css.raw({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }),
  popoverLine: css.raw({
    textStyle: 'body.sm',
    color: 'text.middle',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .circle': {
      marginRight: '8px',
    },
  }),
  popoverHelpText: css.raw({
    textStyle: 'body.sm',
    marginTop: '8px',
  }),
  chain: css.raw({
    display: 'flex',
    alignItems: 'center',
    '& img': {
      height: '24px',
    },
  }),
};
