import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {},
  select: {
    padding: '24px 0 0 0',
    height: '400px', // TODO
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  },
  listContainer: {
    flexGrow: 1,
    height: '100%',
  },
  list: {
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
    overflowY: 'auto' as const,
  },
});
