import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  tableContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    rowGap: '2px',
  },
  titleContainer: {
    backgroundColor: '#242842',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '8px 8px 0px 0px',
  },
  title: {
    ...theme.typography.h3,
    color: theme.palette.text.primary,
  },
  value: {
    ...theme.typography.h3,
    color: theme.palette.text.secondary,
  },
  icon: {
    height: '32px',
    width: '32px',
  },
  filterContainer: {},
  vaultsContainer: {},
});
