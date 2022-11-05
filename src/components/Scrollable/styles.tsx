import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  shadowContainer: {
    position: 'relative' as const,
  },
  thumb: {
    background: '#111321',
    borderRadius: 4,
    zIndex: 10,
  },
  horizontalThumb: {},
  verticalThumb: {},
  track: {
    borderRadius: 4,
  },
  horizontalTrack: {
    right: 0,
    bottom: 0,
    left: 0,
  },
  verticalTrack: {
    right: 0,
    bottom: 2,
    top: 2,
  },
  shadow: {
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    transition: 'opacity 0.2s linear',
  },
  topShadow: {
    left: 0,
    right: 0,
    top: 0,
    height: 80,
    background: 'linear-gradient(0deg, rgba(35, 39, 67, 0) 0%, #232743 100%)',
  },
  bottomShadow: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    background: 'linear-gradient(180deg, rgba(35, 39, 67, 0) 0%, #232743 100%)',
    borderRadius: '12px',
  },
  leftShadow: {
    top: 0,
    bottom: 0,
    left: 0,
    width: 80,
    background: 'linear-gradient(270deg, rgba(35, 39, 67, 0) 0%, #232743 100%)',
  },
  rightShadow: {
    top: 0,
    bottom: 0,
    right: 0,
    width: 80,
    background: 'linear-gradient(90deg, rgba(35, 39, 67, 0) 0%, #232743 100%)',
  },
});
