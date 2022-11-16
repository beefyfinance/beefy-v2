import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  btnContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    columnGap: '8px',
    rowGap: '8px',
  },
  btnSecondary: {
    ...theme.typography['body-lg'],
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    borderRadius: '4px',
    transition: 'color 0.2s',
    padding: '2px 8px',
    width: 'max-content',
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#3F466D',
      transition: 'color 0.1s',
    },
  },
});
