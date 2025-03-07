import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import type { CSSProperties } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';
import { Vault } from '../../../Vault/Vault.tsx';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { css } from '@repo/styles/css';
import { useBreakpoints } from '../../../../../../components/MediaQueries/useBreakpoints.ts';

const useStyles = legacyMakeStyles({
  container: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  }),
});

function useVaultHeightEstimate() {
  const breakpoints = useBreakpoints();
  const smUp = breakpoints.sm;
  const mdUp = breakpoints.md;
  const lgUp = breakpoints.lg;

  return useMemo(() => {
    if (lgUp) {
      // 100 = last normal vault, no border bottom
      // 102 = most normal vaults
      // 126 = two line title
      return 102;
    }

    if (mdUp) {
      // 171 = last normal vault, no border bottom
      // 173 = most normal vaults
      // 191 = boosted vault
      return 173;
    }

    if (smUp) {
      // 242 = last normal vault, no border bottom
      // 244 = most normal vaults
      // 280 = boosted vault
      return 244;
    }

    // at 375w
    // 310 = last normal vault, no border bottom
    // 312 = most normal vaults
    // 336 = two line title
    return 312;
  }, [smUp, mdUp, lgUp]);
}

type VirtualVaultsListProps = {
  vaultIds: VaultEntity['id'][];
};
export const VirtualVaultsList = memo(function VirtualVaultsList({
  vaultIds,
}: VirtualVaultsListProps) {
  const classes = useStyles();
  const totalVaults = vaultIds.length;
  const minBatchSize = 10;
  const [renderCount, setRenderCount] = useState(minBatchSize);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const vaultHeightEstimate = useVaultHeightEstimate();
  const renderVaultIds = useMemo(() => vaultIds.slice(0, renderCount), [vaultIds, renderCount]);
  const remainingVaults = useMemo(() => {
    return Math.max(0, totalVaults - renderCount);
  }, [totalVaults, renderCount]);
  const placeholderStyle = useMemo<Partial<CSSProperties>>(() => {
    return {
      height: `${remainingVaults * vaultHeightEstimate}px`,
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      backgroundSize: `100% ${vaultHeightEstimate}px`,
      backgroundRepeat: 'repeat-y',
      backgroundImage: `linear-gradient(to bottom, #242842 0px, #242842 ${
        vaultHeightEstimate - 2
      }px,  #242842 ${vaultHeightEstimate - 2}px, #242842 100%)`,
    };
  }, [remainingVaults, vaultHeightEstimate]);

  // Render more vaults on intersection (won't trigger again until placeholder is {vaultHeightEstimate * 2}px off screen)
  const onIntersection = useCallback(
    (inView: boolean) => {
      if (inView && remainingVaults > 0 && bottomRef.current) {
        const batchSize =
          minBatchSize +
          Math.ceil(
            (window.scrollY - bottomRef.current.offsetTop + window.innerHeight) /
              vaultHeightEstimate
          );
        setRenderCount(count => count + Math.max(0, Math.min(batchSize, totalVaults - count)));
      }
    },
    [totalVaults, setRenderCount, minBatchSize, vaultHeightEstimate, remainingVaults]
  );

  // Render more vaults on scroll
  const onScroll = useMemo(
    () =>
      debounce(() => {
        if (!bottomRef.current) return;

        if (
          remainingVaults > 0 &&
          window.scrollY + window.innerHeight > bottomRef.current.offsetTop
        ) {
          const batchSize =
            minBatchSize +
            Math.ceil(
              (window.scrollY - bottomRef.current.offsetTop + window.innerHeight) /
                vaultHeightEstimate
            );
          setRenderCount(count => count + Math.max(0, Math.min(batchSize, totalVaults - count)));
        }
      }, 100),
    [totalVaults, setRenderCount, minBatchSize, vaultHeightEstimate, remainingVaults]
  );

  // Get notified when the placeholder is {vaultHeightEstimate * 2}px from entering the screen
  const [placeholderRef] = useInView({
    onChange: onIntersection,
    rootMargin: `0px 0px ${vaultHeightEstimate * 2}px 0px`,
  });

  // Increase/shrink render count based on total number of vaults when filters change
  useEffect(() => {
    if (renderCount > totalVaults) {
      setRenderCount(totalVaults);
    } else if (renderCount < minBatchSize) {
      setRenderCount(Math.min(minBatchSize, totalVaults));
    }
  }, [renderCount, totalVaults]);

  // Scroll is backup, normal speed scrolling should be handled by intersection observer
  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onScroll]);

  return (
    <>
      <div className={classes.container} ref={containerRef}>
        {renderVaultIds.map(vaultId => (
          <Vault vaultId={vaultId} key={vaultId} />
        ))}
      </div>
      <div ref={bottomRef} />
      <div style={placeholderStyle} ref={placeholderRef} />
    </>
  );
});
