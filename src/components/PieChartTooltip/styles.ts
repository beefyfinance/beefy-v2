import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    colorPalette: 'tooltip.light',
    background: 'colorPalette.background',
    color: 'colorPalette.text',
    borderRadius: '4px',
    minWidth: '150px',
    maxWidth: '180px',
    padding: '8px',
  }),
  titleContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    marginBottom: '8px',
  }),
  infoContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
  }),
  icon: css.raw({
    height: '24px',
    width: '24px',
  }),
  title: css.raw({
    textStyle: 'body.medium',
    color: 'colorPalette.text.title',
    textTransform: 'uppercase',
    textOverflow: 'ellipsis',
    width: '90%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
  valueContainer: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  value: css.raw({
    textStyle: 'body.sm',
    color: 'colorPalette.text.item',
  }),
  label: css.raw({
    textStyle: 'body.sm.medium',
    color: 'colorPalette.text.label',
  }),
  triangle: css.raw({
    width: '0',
    height: '0',
    marginLeft: '10px',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid white',
  }),
};
