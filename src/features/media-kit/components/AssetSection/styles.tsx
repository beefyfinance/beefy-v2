import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  sectionHeader: {
    ...theme.typography['h3'],
    color: theme.palette.text.secondary,
    margin: '40px 10px 16px 0',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    columnGap: '24px',
    rowGap: '24px',
    marginBottom: theme.spacing(6),
  },
});
