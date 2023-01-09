import { Theme } from '@material-ui/core/styles';
import { DEFAULT_SIZE } from '../AssetsImage/styles';

export const styles = (theme: Theme) => ({
  '@keyframes scrollBackground': {
    '0%': {
      backgroundPosition: '0 0',
    },
    '50%': {
      backgroundPosition: '100% 0',
    },
    '100%': {
      backgroundPosition: '0 0',
    },
  },
  holder: {
    backgroundImage: 'linear-gradient(90deg, #313759, #8585A6, #313759)',
    backgroundSize: '300% 100%',
    animationName: '$scrollBackground',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease',
    borderRadius: '50%',
    width: DEFAULT_SIZE,
    height: DEFAULT_SIZE,
  },
});
