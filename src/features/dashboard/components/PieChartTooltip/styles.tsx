import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: '#FFF',
    borderRadius: '4px',
    width: '150px',
    padding: '8px',
    '&:focus': {
      outline: 'none',
    },
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    marginBottom: '8px',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '4px',
  },

  icon: {
    height: '24px',
    width: '24px',
  },
  title: {
    ...theme.typography['body-lg-med'],
    color: '#272B4A',
    textTransform: 'uppercase' as const,
  },
  valueContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  value: {
    ...theme.typography['body-sm'],
    color: '#73768C',
  },
  label: {
    ...theme.typography['body-sm-med'],
    color: '#363C63',
  },
});
