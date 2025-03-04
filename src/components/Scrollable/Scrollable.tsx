import {
  forwardRef,
  type HTMLAttributes,
  memo,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import type { ScrollbarProps } from 'react-custom-scrollbars-2';
import { Scrollbars as ScrollContainer } from 'react-custom-scrollbars-2';
import { styles } from './styles.ts';
import { css, type CssStyles, cx } from '@repo/styles/css';
import type { HtmlProps, Override } from '../../features/data/utils/types-utils.ts';

type DivProps = HtmlProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type ScrollDirection = 'horizontal' | 'vertical';

type ThumbProps = Override<
  DivProps,
  {
    mode: ScrollDirection;
    css?: CssStyles;
  }
>;

const Thumb = memo(
  forwardRef<HTMLDivElement, ThumbProps>(function ({ mode, css: cssProp, ...props }, ref) {
    return (
      <div {...props} ref={ref} className={css(styles.thumb, styles[`${mode}Thumb`], cssProp)} />
    );
  })
);

function renderThumbHorizontal(props: DivProps) {
  return <Thumb {...props} mode="horizontal" />;
}

function renderThumbVertical(props: DivProps) {
  return <Thumb {...props} mode="vertical" />;
}

type TrackProps = Override<
  DivProps,
  {
    mode: ScrollDirection;
  }
>;

const Track = memo(
  forwardRef<HTMLDivElement, TrackProps>(function ({ mode, ...props }, ref) {
    return <div {...props} ref={ref} className={css(styles.track, styles[`${mode}Track`])} />;
  })
);

function renderTrackHorizontal(props: DivProps) {
  return <Track {...props} mode="horizontal" />;
}

function renderTrackVertical(props: DivProps) {
  return <Track {...props} mode="vertical" />;
}

export type ScrollableProps = {
  children: ReactNode;
  autoHeight?: boolean | number;
  css?: CssStyles;
  shadowCss?: CssStyles;
  topShadowCss?: CssStyles;
  bottomShadowCss?: CssStyles;
  leftShadowCss?: CssStyles;
  rightShadowCss?: CssStyles;
  thumbCss?: CssStyles;
  hideShadows?: boolean;
};

export const Scrollable = memo(function Scrollable({
  children,
  css: cssProp,
  shadowCss,
  topShadowCss,
  bottomShadowCss,
  leftShadowCss,
  rightShadowCss,
  thumbCss,
  autoHeight = false,
  hideShadows = false,
}: ScrollableProps) {
  const [shadows, setShadows] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });
  const handleUpdate = useCallback<Exclude<ScrollbarProps['onUpdate'], undefined>>(
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
  const thumbClassName = useMemo(() => css(thumbCss), [thumbCss]);
  const handleRenderThumbHorizontal = useCallback(
    (props: DivProps) => {
      return renderThumbHorizontal({ ...props, className: cx(props.className, thumbClassName) });
    },
    [thumbClassName]
  );
  const handleRenderThumbVertical = useCallback(
    (props: DivProps) => {
      return renderThumbVertical({ ...props, className: cx(props.className, thumbClassName) });
    },
    [thumbClassName]
  );

  return (
    <div className={css(styles.shadowContainer, cssProp)}>
      <ScrollContainer
        renderThumbVertical={handleRenderThumbVertical}
        renderThumbHorizontal={handleRenderThumbHorizontal}
        renderTrackVertical={renderTrackVertical}
        renderTrackHorizontal={renderTrackHorizontal}
        onUpdate={handleUpdate}
        autoHeight={!!autoHeight}
        autoHeightMax={
          !autoHeight ? undefined : typeof autoHeight === 'boolean' ? 99999999 : autoHeight
        }
      >
        {children}
      </ScrollContainer>
      {!hideShadows && (
        <>
          <div
            className={css(styles.shadow, styles.topShadow, shadowCss, topShadowCss)}
            style={{ opacity: shadows.top }}
          />
          <div
            className={css(styles.shadow, styles.bottomShadow, shadowCss, bottomShadowCss)}
            style={{ opacity: shadows.bottom }}
          />
          <div
            className={css(styles.shadow, styles.leftShadow, shadowCss, leftShadowCss)}
            style={{ opacity: shadows.left }}
          />
          <div
            className={css(styles.shadow, styles.rightShadow, shadowCss, rightShadowCss)}
            style={{ opacity: shadows.right }}
          />
        </>
      )}
    </div>
  );
});
