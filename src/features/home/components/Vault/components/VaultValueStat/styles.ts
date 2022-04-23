import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  value: {
    color: '#D0D0DA',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 700,
    fontSize: '15px',
    lineHeight: '24px',
  },
  subValue: {
    color: '#8A8EA8',
    fontFamily: theme.typography.fontFamily,
    fontSize: '12px',
    lineHeight: '18px',
  },
  blurValue: {
    filter: 'blur(.5rem)',
  },
  boostedValue: {
    color: '#DB8332',
  },
});
