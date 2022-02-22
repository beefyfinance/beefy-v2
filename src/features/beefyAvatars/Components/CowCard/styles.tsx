export const styles = theme => ({
  card: {
    background: '#14182B',
    border: `2px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    margin: `0px 4px 8px 4px`,
    width: 'calc(25% - 8px)',
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: 700,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    '& svg ': {
      borderRadius: '4px',
      width: '150px',
      height: '150px',
    },
  },
});
