import { makeStyles, useMediaQuery } from '@material-ui/core';
import type { Theme } from '@material-ui/core';
import type { CSSProperties, MutableRefObject } from 'react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';
import { Vault } from '../../../Vault';
import type { VaultEntity } from '../../../../../data/entities/vault';

const useStyles = makeStyles(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
}));

function useVaultHeightEstimate() {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'), { noSsr: true });
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true });
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'), { noSsr: true });

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
export const VirtualVaultsList = memo<VirtualVaultsListProps>(function VirtualVaultsList({
  vaultIds,
}) {
  const classes = useStyles();
  const totalVaults = vaultIds.length;
  const minBatchSize = 10;
  const [renderCount, setRenderCount] = useState(minBatchSize);
  const containerRef = useRef<HTMLDivElement>();
  const bottomRef = useRef<HTMLDivElement>();
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
    inView => {
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
      <div className={classes.container} ref={containerRef as MutableRefObject<HTMLDivElement>}>
        {renderVaultIds.map(vaultId => (
          <Vault vaultId={vaultId} key={vaultId} />
        ))}
      </div>
      <div ref={bottomRef as MutableRefObject<HTMLDivElement>} />
      <div style={placeholderStyle} ref={placeholderRef} />
    </>
  );
});
