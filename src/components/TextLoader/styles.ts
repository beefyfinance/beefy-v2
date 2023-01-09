import { Theme } from '@material-ui/core/styles';

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
  placeholder: {
    lineHeight: 'inherit',
    display: 'inline-block',
    opacity: '0',
    visibility: 'hidden' as const,
    userSelect: 'none' as const,
    pointerEvents: 'none' as const,
  },
  holder: {
    display: 'inline-block',
    position: 'relative' as const,
  },
  loader: {
    backgroundImage: 'linear-gradient(90deg, #313759, #8585A6, #313759)',
    backgroundSize: '300% 100%',
    animationName: '$scrollBackground',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease',
    borderRadius: '0.25em',
    display: 'inline-block',
    position: 'absolute' as const,
    height: '1em',
    width: '100%',
    left: '0',
    top: '50%',
    transform: 'translate(0,-50%)',
  },
});
