import React, { forwardRef, memo, ReactNode, useCallback, useState } from 'react';
import { ScrollbarProps, Scrollbars as ScrollContainer } from 'react-custom-scrollbars-2';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type ThumbProps = {
  mode: 'horizontal' | 'vertical';
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
  mode: 'horizontal' | 'vertical';
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
  className?: string;
};
export const Scrollable = memo<ScrollableProps>(function Scrollable({ children, className }) {
  const classes = useStyles();
  const [shadowTopOpacity, setShadowTopOpacity] = useState(0);
  const [shadowBottomOpacity, setShadowBottomOpacity] = useState(0);
  const handleUpdate = useCallback<ScrollbarProps['onUpdate']>(
    ({ scrollTop, scrollHeight, clientHeight }) => {
      setShadowTopOpacity((1 / 20) * Math.min(scrollTop, 20));
      const bottomScrollTop = scrollHeight - clientHeight;
      setShadowBottomOpacity(
        (1 / 20) * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20))
      );
    },
    [setShadowTopOpacity, setShadowBottomOpacity]
  );

  return (
    <div className={clsx(classes.shadowContainer, className)}>
      <ScrollContainer
        renderThumbVertical={renderThumbVertical}
        renderThumbHorizontal={renderThumbHorizontal}
        renderTrackHorizontal={renderTrackHorizontal}
        renderTrackVertical={renderTrackVertical}
        onUpdate={handleUpdate}
      >
        {children}
      </ScrollContainer>
      <div
        className={clsx(classes.shadow, classes.topShadow)}
        style={{ opacity: shadowTopOpacity }}
      />
      <div
        className={clsx(classes.shadow, classes.bottomShadow)}
        style={{ opacity: shadowBottomOpacity }}
      />
    </div>
  );
});
