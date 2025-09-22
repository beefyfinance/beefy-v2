import { css } from '@repo/styles/css';

export const styles = {
  shadowContainer: css.raw({
    position: 'relative',
  }),
  nativeScrollContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: '100%',
    position: 'relative',
  }),
  nativeScrollContent: css.raw({
    flex: '1 1 auto',
    overflow: 'auto',
    minHeight: 0,
    position: 'relative',
    width: '100%',
    // Ensure proper scrolling on webkit browsers
    WebkitOverflowScrolling: 'touch',
    // Prevent horizontal scrollbar unless needed
    overflowX: 'hidden',
  }),
  thumb: css.raw({
    background: 'background.content.dark',
    borderRadius: '4',
    zIndex: 'thumb',
  }),
  track: css.raw({
    borderRadius: '4',
    width: '4px',
  }),
  horizontalTrack: css.raw({
    right: '0',
    bottom: '0',
    left: '0',
  }),
  verticalTrack: css.raw({
    right: '0',
    bottom: '2',
    top: '2',
  }),
  shadow: css.raw({
    position: 'absolute',
    pointerEvents: 'none',
    transition: 'opacity 0.2s linear',
  }),
  topShadow: css.raw({
    left: '0',
    right: '0',
    top: '0',
    height: '80',
    background: 'linear-gradient(0deg, rgba(35, 39, 67, 0) 0%, {colors.background.content} 100%)',
  }),
  bottomShadow: css.raw({
    left: '0',
    right: '0',
    bottom: '0',
    height: '80',
    background: 'linear-gradient(180deg, rgba(35, 39, 67, 0) 0%, {colors.background.content} 100%)',
  }),
  leftShadow: css.raw({
    top: '0',
    bottom: '0',
    left: '0',
    width: '80',
    background: 'linear-gradient(270deg, rgba(35, 39, 67, 0) 0%, {colors.background.content} 100%)',
  }),
  rightShadow: css.raw({
    top: '0',
    bottom: '0',
    right: '0',
    width: '80',
    background: 'linear-gradient(90deg, rgba(35, 39, 67, 0) 0%, {colors.background.content} 100%)',
  }),
};
