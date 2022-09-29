import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  text: {
    color: theme.palette.text.secondary,
    marginBottom: '24px',
  },
  boostedBy: {
    ...theme.typography['h2'],
    color: '#DB8332',
    flexGrow: 1,
    '& span': {
      color: theme.palette.text.primary,
    },
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '16px',
    padding: '24px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.default,
  },
  socials: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
});
