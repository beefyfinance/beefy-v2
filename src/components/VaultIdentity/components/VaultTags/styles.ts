import { css } from '@repo/styles/css';

export const styles = {
  vaultTags: css.raw({
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    columnGap: '8px',
    rowGap: '8px',
    '@media (max-width: 400px)': {
      flexWrap: 'wrap',
    },
  }),
  vaultTag: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 600,
    color: 'text.middle',
    backgroundColor: 'bayOfMany',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    display: 'flex',
    flexShrink: '0',
    '&:not(:first-child)': {
      flexShrink: '1',
      minWidth: '0',
      gap: '4px',
    },
  }),
  vaultTagIcon: css.raw({
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  vaultTagText: css.raw({
    flexShrink: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: '0',
  }),
  vaultTagBoost: css.raw({
    background: 'tags.boost.background',
    color: 'background.content',
  }),
  vaultTagBoostIcon: css.raw({
    width: '12px',
    height: '20px',
    padding: '4px 0',
    marginRight: '4px',
    verticalAlign: 'bottom',
  }),
  vaultTagEarn: css.raw({
    backgroundColor: 'tags.earnings.background',
  }),
  vaultTagPoints: css.raw({
    backgroundColor: 'tags.earnings.background',
  }),
  vaultTagRetired: css.raw({
    backgroundColor: 'tags.retired.background',
  }),
  vaultTagPaused: css.raw({
    backgroundColor: 'tags.paused.background',
  }),
  vaultTagClm: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 'bold',
    backgroundColor: 'tags.clm.background',
    '& span': {
      fontWeight: 'medium',
    },
  }),
  vaultTagClmIcon: css.raw({
    width: '12',
    height: '12',
    display: 'block',
  }),
  vaultTagClmTextAutoHide: css.raw({
    mdDown: {
      display: 'none',
    },
  }),
  platformTagGov: css.raw({
    backgroundColor: 'tags.platform.gov.background',
  }),
  platformTagClm: css.raw({
    backgroundColor: 'tags.platform.clm.background',
  }),
  divider: css.raw({
    height: '8px',
    width: '1px',
    borderRadius: '8px',
    backgroundColor: 'vaultTagDividerBackground',
  }),
  flexWrap: css.raw({
    flexWrap: 'wrap',
  }),
  inverted: css.raw({
    flexDirection: 'row-reverse',
  }),
};
