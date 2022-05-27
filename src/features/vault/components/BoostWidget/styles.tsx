import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
  },
  containerBoost: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    borderRadius: '12px',
  },
  containerExpired: {
    padding: '24px',
    backgroundColor: theme.palette.background.default,
    borderRadius: '12px',
  },
  expiredBoostContainer: {
    background: theme.palette.background.vaults.defaultOutline,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
  },
  boostImg: {
    width: 30,
    height: 30,
    marginLeft: '-8px',
  },
  title: {
    ...theme.typography['h2'],
    color: '#E88225',
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 24px 0',
  },
  titleIcon: {
    marginRight: '8px',
  },
  titleWhite: {
    color: '#fff',
  },
  titleTooltip: {
    color: theme.palette.text.secondary,
    fontSize: '20px',
    width: '20px',
    height: '20px',
    marginLeft: '8px',
    '& .MuiSvgIcon-root': {
      fontSize: 'inherit',
      display: 'block',
    },
  },
  boostStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    rowGap: '16px',
    columnGap: '16px',
    margin: '0 0 24px 0',
  },
  boostStat: {
    '& :last-child': {
      marginBottom: 0,
    },
  },
  boostStatLabel: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
  },
  boostStatValue: {
    ...theme.typography['body-lg-bold'],
    color: theme.palette.text.secondary,
  },
  button: {
    '& + $button': {
      marginTop: '12px',
    },
  },
  expiredBoostName: {
    marginBottom: '8px',
  },
});
