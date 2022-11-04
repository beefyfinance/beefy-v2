import { makeStyles, useMediaQuery } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const HorizontalScrolleable = memo(function ({ children }) {
  const classes = useStyles();
  const [shadowLeftOpacity, setShadowLeftOpacity] = React.useState(0);
  const [shadowRightOpacity, setShadowRightOpacity] = React.useState(0);
  const isScrolleable = useMediaQuery('(max-width: 959px)');

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollWidth, clientWidth, scrollLeft } = event.currentTarget;
    setShadowLeftOpacity((1 / 20) * Math.min(scrollLeft, 20));
    const bottomscrollLeft = scrollWidth - clientWidth;
    setShadowRightOpacity(
      (1 / 20) * (bottomscrollLeft - Math.max(scrollLeft, bottomscrollLeft - 20))
    );
  };

  return (
    <div onScroll={handleScroll} className={classes.scroller}>
      {isScrolleable && (
        <div
          className={clsx(classes.shadow, classes.leftShadow)}
          style={{ opacity: shadowLeftOpacity }}
        />
      )}
      {children}
      {isScrolleable && (
        <div
          className={clsx(classes.shadow, classes.rightShadow)}
          style={{ opacity: shadowRightOpacity }}
        />
      )}
    </div>
  );
});
