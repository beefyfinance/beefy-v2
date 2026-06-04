import { styled } from '@repo/styles/jsx';
import { memo, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useResizeDetector } from 'react-resize-detector';

const DEFAULT_SPEED_PX_PER_S = 40;

export type MarqueeProps = {
  /** content to scroll (duplicated for a gap-less, seamless loop) */
  children: ReactNode;
  /** scroll speed in px/second — longer content takes proportionally longer @default 40 */
  speed?: number;
  /** applied to the scrolling content element — use it to style `children` */
  className?: string;
};

/**
 * Detect whether the inner content overflows its (overflow-hidden) viewport.
 * Observes BOTH the viewport and the inner: the viewport width only changes on
 * container resize, but the inner content can grow on its own (late-loading
 * content, a webfont swap) which must also re-trigger detection.
 */
function useMarqueeOverflow() {
  const { width: viewportWidth, ref: viewportRef } = useResizeDetector<HTMLDivElement>();
  const { width: innerWidth, ref: innerRef } = useResizeDetector<HTMLDivElement>();
  const [overflowPx, setOverflowPx] = useState(0);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const viewport = viewportRef.current;
    if (!inner || !viewport) {
      setOverflowPx(0);
      return;
    }
    const diff = inner.scrollWidth - viewport.clientWidth;
    setOverflowPx(diff > 0 ? diff : 0);
  }, [viewportWidth, innerWidth, viewportRef, innerRef]);

  return { viewportRef, innerRef, innerWidth, isOverflowing: overflowPx > 0 };
}

export const Marquee = memo(function Marquee({
  children,
  speed = DEFAULT_SPEED_PX_PER_S,
  className,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { viewportRef, innerRef, innerWidth, isOverflowing } = useMarqueeOverflow();
  const [duration, setDuration] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !isOverflowing) {
      setDuration(0);
      return;
    }
    // The loop translates by -50% of the track, i.e. exactly one copy (content + its
    // trailing gap) = half the two-copy track width. duration = distance / speed keeps
    // the scroll speed constant regardless of content length.
    const distance = track.scrollWidth / 2;
    setDuration(distance / speed);
  }, [isOverflowing, innerWidth, speed]);

  const style = { '--marquee-duration': `${duration}s` } as CSSProperties;

  return (
    <Viewport ref={viewportRef} overflowing={isOverflowing} style={style}>
      <Track ref={trackRef} overflowing={isOverflowing}>
        <Content ref={innerRef} overflowing={isOverflowing} className={className}>
          {children}
        </Content>
        {isOverflowing ?
          <Content aria-hidden="true" overflowing className={className}>
            {children}
          </Content>
        : null}
      </Track>
    </Viewport>
  );
});

// Shared edge-fade overlays (rendered via ::before/::after only when overflowing).
const marqueeFade = {
  content: '""',
  position: 'absolute',
  top: '0',
  bottom: '0',
  width: '32px',
  pointerEvents: 'none',
  zIndex: '[1]',
} as const;

const Viewport = styled('div', {
  base: {
    position: 'relative',
    flex: '1 1 auto',
    minWidth: '0',
    overflow: 'hidden',
  },
  variants: {
    overflowing: {
      true: {
        '&::after': {
          ...marqueeFade,
          right: '0',
          background:
            'linear-gradient(to right, rgba(36, 40, 66, 0) 0%, {colors.background.cardBody} 100%)',
        },
        '&::before': {
          ...marqueeFade,
          left: '0',
          background:
            'linear-gradient(to right, {colors.background.cardBody} 0%, rgba(36, 40, 66, 0) 100%)',
        },
      },
    },
  },
});

const Track = styled('div', {
  base: {
    display: 'flex',
    width: 'max-content',
    willChange: 'transform',
  },
  variants: {
    overflowing: {
      true: {
        animation: 'featuredVaultMarqueeLoop var(--marquee-duration, 10s) linear infinite',
      },
    },
  },
});

const Content = styled('div', {
  base: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  variants: {
    overflowing: {
      true: {
        paddingRight: '48px',
      },
    },
  },
});
