import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../../hooks/useMediaQuery.ts';
import { FeaturedVaultCard } from '../FeaturedVaultCard/FeaturedVaultCard.tsx';
import { selectFeaturedVaultIds } from '../../../data/selectors/featured-vaults.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';

const DRAG_THRESHOLD_PX = 5;
// Keep in sync with the `columnGap` on Scroller below.
const GAP_PX = 2;

const PAGE_SIZE_DESKTOP = 4;
const PAGE_SIZE_TABLET = 3;
const PAGE_SIZE_SMALL = 2;
const PAGE_SIZE_STACKED = 1;

const MEDIA_SIDE_BY_SIDE = '(min-width: 600px)';
const MEDIA_TABLET = '(min-width: 768px)';
const MEDIA_DESKTOP = '(min-width: 960px)';

export const FeaturedVaults = memo(function FeaturedVaults() {
  const { t } = useTranslation();
  const ids = useAppSelector(selectFeaturedVaultIds);
  const isSideBySide = useMediaQuery(MEDIA_SIDE_BY_SIDE);
  const isTablet = useMediaQuery(MEDIA_TABLET);
  const isDesktop = useMediaQuery(MEDIA_DESKTOP);
  const pageSize =
    isDesktop ? PAGE_SIZE_DESKTOP
    : isTablet ? PAGE_SIZE_TABLET
    : isSideBySide ? PAGE_SIZE_SMALL
    : PAGE_SIZE_STACKED;

  const pageCount = Math.ceil(ids.length / pageSize);
  const isListing = pageCount > 1;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!isListing || !scroller) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const stride = scroller.clientWidth + GAP_PX;
      if (stride <= 0) return;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      // A partial last page can't scroll a full viewport-width from the start (its
      // first card is pinned to the right edge), so stride-rounding never reaches
      // the last index. Snap the active page to the last when scrolled to the end.
      const idx =
        scroller.scrollLeft >= maxScroll - 1 ?
          pageCount - 1
        : Math.min(pageCount - 1, Math.max(0, Math.round(scroller.scrollLeft / stride)));
      setActivePage(idx);
    };
    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isListing, pageCount]);

  const handleDotClick = useCallback((pageIdx: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: pageIdx * (scroller.clientWidth + GAP_PX), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!isListing || !scroller) return;

    let isDown = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;
    let capturedPointerId: number | null = null;

    // Idempotent: releases pointer capture and clears the inline drag styles.
    const resetDrag = () => {
      if (capturedPointerId !== null) {
        if (scroller.hasPointerCapture(capturedPointerId)) {
          scroller.releasePointerCapture(capturedPointerId);
        }
        capturedPointerId = null;
      }
      scroller.style.scrollSnapType = '';
      scroller.style.cursor = '';
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      isDown = true;
      didDrag = false;
      startX = e.clientX;
      startScrollLeft = scroller.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!didDrag && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        didDrag = true;
        capturedPointerId = e.pointerId;
        scroller.setPointerCapture(e.pointerId);
        scroller.style.scrollSnapType = 'none';
        scroller.style.cursor = 'grabbing';
      }
      if (didDrag) {
        scroller.scrollLeft = startScrollLeft - dx;
      }
    };
    const endDrag = () => {
      if (didDrag) {
        resetDrag();
      }
      isDown = false;
    };
    const onClickCapture = (e: MouseEvent) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    };

    scroller.addEventListener('pointerdown', onPointerDown);
    scroller.addEventListener('pointermove', onPointerMove);
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', onClickCapture, true);
    return () => {
      scroller.removeEventListener('pointerdown', onPointerDown);
      scroller.removeEventListener('pointermove', onPointerMove);
      scroller.removeEventListener('pointerup', endDrag);
      scroller.removeEventListener('pointercancel', endDrag);
      scroller.removeEventListener('click', onClickCapture, true);
      // If torn down mid-drag, no pointerup fires — undo styles & release capture.
      resetDrag();
    };
  }, [isListing]);

  if (ids.length === 0) return null;

  return (
    <Section>
      <Header>
        <Title>
          {t('FeaturedVaults-Title')}
          {isSideBySide && (
            <TitleDescription>{t('FeaturedVaults-Title-Description')}</TitleDescription>
          )}
        </Title>
        {isListing && (
          <Dots>
            {Array.from({ length: pageCount }, (_, i) => (
              <Dot
                key={i}
                type="button"
                active={i === activePage}
                aria-label={`Go to page ${i + 1}`}
                onClick={() => handleDotClick(i)}
              />
            ))}
          </Dots>
        )}
      </Header>
      <Scroller ref={scrollerRef} listing={isListing}>
        {ids.map((id, index) => (
          <CardSlot
            key={id}
            listing={isListing}
            pageStart={index % pageSize === 0}
            style={{
              flexBasis:
                isSideBySide ?
                  `calc((100% - ${pageSize - 1} * ${GAP_PX}px) / ${pageSize})`
                : '100%',
            }}
          >
            <FeaturedVaultCard vaultId={id} />
          </CardSlot>
        ))}
      </Scroller>
    </Section>
  );
});

const Section = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
    paddingTop: '12px',
    marginBottom: '10px',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'background.content.dark',
  },
});

const Header = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: '24px',
    minHeight: '24px',
  },
});

const Title = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'baseline',
    columnGap: '8px',
    minWidth: '0',
    textStyle: 'body.medium',
    fontWeight: 'semiBold',
    color: 'text.middle',
  },
});

const TitleDescription = styled('span', {
  base: {
    textStyle: 'body',
    fontWeight: 'normal',
    color: 'text.dark',
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

const Dots = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
  },
});

const Dot = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    padding: '0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    '&::before': {
      content: '""',
      display: 'block',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: 'text.dark',
      opacity: 0.4,
      transition: 'opacity 120ms ease, background 120ms ease',
    },
  },
  variants: {
    active: {
      true: {
        '&::before': {
          opacity: 1,
          background: 'text.light',
        },
      },
    },
  },
});

const Scroller = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '0',
    width: '100%',
    columnGap: '2px',
  },
  variants: {
    listing: {
      true: {
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      },
    },
  },
});

const CardSlot = styled('div', {
  base: {
    display: 'flex',
    minWidth: '0',
    flexGrow: 1,
    flexShrink: 0,
  },
  variants: {
    listing: { true: {} },
    pageStart: { true: {} },
  },
  compoundVariants: [
    {
      listing: true,
      pageStart: true,
      css: { scrollSnapAlign: 'start' },
    },
  ],
});
