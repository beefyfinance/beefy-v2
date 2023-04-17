import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  vaultTags: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    columnGap: '8px',
    rowGap: '8px',
  },
  vaultTag: {
    ...theme.typography['subline-sm'],
    color: '#D0D0DA',
    backgroundColor: '#4C5480',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    '&:not(:first-child)': {
      flexShrink: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minWidth: 0,
    },
  },
  vaultTagBoost: {
    backgroundColor: 'rgba(219, 131, 50, 0.3)',
  },
  vaultTagRetired: {
    backgroundColor: 'rgba(209, 83, 71, 0.3)',
  },
  vaultTagPaused: {
    backgroundColor: 'rgba(209, 152, 71, 0.3)',
  },
  vaultTagEarn: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
