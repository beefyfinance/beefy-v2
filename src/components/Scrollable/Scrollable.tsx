import React, { forwardRef, memo, ReactNode, useCallback, useState } from 'react';
import { ScrollbarProps, Scrollbars as ScrollContainer } from 'react-custom-scrollbars-2';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type ScrollDirection = 'horizontal' | 'vertical';

type ThumbProps = {
  mode: ScrollDirection;
};
const Thumb = memo(
  forwardRef<HTMLDivElement, ThumbProps>(function ({ mode, ...props }, ref) {
    const classes = useStyles();

    return <div {...props} ref={ref} className={clsx(classes.thumb, classes[`${mode}Thumb`])} />;
  })
);

function renderThumbHorizontal(props) {
  return <Thumb {...props} mode="horizontal" />;
}

function renderThumbVertical(props) {
  return <Thumb {...props} mode="vertical" />;
}

type TrackProps = {
  mode: ScrollDirection;
};
const Track = memo(
  forwardRef<HTMLDivElement, TrackProps>(function ({ mode, ...props }, ref) {
    const classes = useStyles();

    return <div {...props} ref={ref} className={clsx(classes.track, classes[`${mode}Track`])} />;
  })
);

function renderTrackHorizontal(props) {
  return <Track {...props} mode="horizontal" />;
}

function renderTrackVertical(props) {
  return <Track {...props} mode="vertical" />;
}

export type ScrollableProps = {
  children: ReactNode;
  autoHeight?: boolean;
  className?: string;
};
export const Scrollable = memo<ScrollableProps>(function Scrollable({
  children,
  className,
  autoHeight = false,
}) {
  const classes = useStyles();
  const [shadows, setShadows] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const handleUpdate = useCallback<ScrollbarProps['onUpdate']>(
    ({ scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth }) => {
      const bottomScrollTop = scrollHeight - clientHeight;
      const rightScrollLeft = scrollWidth - clientWidth;

      setShadows({
        top: (1 / 20) * Math.min(scrollTop, 20),
        bottom: (1 / 20) * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20)),
        left: (1 / 20) * Math.min(scrollLeft, 20),
        right: (1 / 20) * (rightScrollLeft - Math.max(scrollLeft, rightScrollLeft - 20)),
      });
    },
    [setShadows]
  );

  return (
    <div className={clsx(classes.shadowContainer, className)}>
      <ScrollContainer
        renderThumbVertical={renderThumbVertical}
        renderThumbHorizontal={renderThumbHorizontal}
        renderTrackHorizontal={renderTrackHorizontal}
        renderTrackVertical={renderTrackVertical}
        onUpdate={handleUpdate}
        autoHeight={autoHeight}
        autoHeightMax={autoHeight ? 99999999 : undefined}
      >
        {children}
      </ScrollContainer>
      <div className={clsx(classes.shadow, classes.topShadow)} style={{ opacity: shadows.top }} />
      <div
        className={clsx(classes.shadow, classes.bottomShadow)}
        style={{ opacity: shadows.bottom }}
      />
      <div className={clsx(classes.shadow, classes.leftShadow)} style={{ opacity: shadows.left }} />
      <div
        className={clsx(classes.shadow, classes.rightShadow)}
        style={{ opacity: shadows.right }}
      />
    </div>
  );
});
