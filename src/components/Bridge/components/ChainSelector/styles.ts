import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  iconWithChain: {
    display: 'flex',
    alignItems: 'center',
  },
  iconWithChainIcon: {
    marginRight: '8px',
  },
  select: {
    backgroundColor: 'transparent',
    padding: `${8 - 2}px ${12 - 2}px`,
  },
  selectIcon: {
    fontSize: '20px',
  },
});
