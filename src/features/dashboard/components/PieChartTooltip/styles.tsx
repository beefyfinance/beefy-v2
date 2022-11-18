import { Theme } from '@material-ui/core';
export const styles = (theme: Theme) => ({
  container: {
    backgroundColor: '#FFF',
    borderRadius: '4px',
    minWidth: '150px',
    maxWidth: '180px',
    padding: '8px',
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
    textOverflow: 'ellipsis',
    width: '90%',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
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
  triangle: {
    width: 0,
    height: 0,
    marginLeft: '10px',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: '8px solid #FFF',
  },
});
