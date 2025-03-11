import { css } from '@repo/styles/css';

export const styles = {
  title: css.raw({
    textStyle: 'body.medium',
    color: 'blackMarket',
    display: 'flex',
    alignItems: 'center',
  }),
  titleContainer: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: '0',
    marginBottom: '4px',
  }),
  closeIcon: css.raw({
    padding: '0',
  }),
};
