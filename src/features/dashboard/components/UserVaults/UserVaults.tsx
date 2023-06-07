import { makeStyles } from '@material-ui/styles';
import { useTranslation } from 'react-i18next';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash-es';
import { useInView } from 'react-intersection-observer';
import { Section } from '../../../../components/Section';
import { styles } from './styles';
import { Filter } from './components/Filter';
import { Vault } from './components/Vault';
import { useSortedDashboardVaults } from './hook';
import type { VaultEntity } from '../../../data/entities/vault';
import { NoVaults } from './components/NoVaults';
import type { Theme } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';

const useStyles = makeStyles(styles);

export const UserVaults = memo(function UserVaults() {
  const { t } = useTranslation();

  const {
    sortedFilteredVaults,
    sortedOptions,
    handleSort,
    handleSearchText,
    searchText,
    handleClearText,
  } = useSortedDashboardVaults();

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });

  const subTitle = useMemo(() => {
    return mdDown ? 'Dashboard-Your-Vaults-Subtitle-Mobile' : 'Dashboard-Your-Vaults-Subtitle';
  }, [mdDown]);

  return (
    <Section title={t('Dashboard-Your-Vaults-Title')} subTitle={t(subTitle)}>
      <Filter
        sortOptions={sortedOptions}
        handleSort={handleSort}
        handleSearchText={handleSearchText}
        searchText={searchText}
        handleClearText={handleClearText}
      />
      {sortedFilteredVaults.length === 0 ? <NoVaults /> : null}
      <VirtualList vaults={sortedFilteredVaults} />
    </Section>
  );
});

export const VirtualList = memo(function VirtualList({ vaults }: { vaults: VaultEntity[] }) {
  const classes = useStyles();
  const totalVaults = vaults.length;
  const minBatchSize = 3;
  const [renderCount, setRenderCount] = useState(minBatchSize);
  const containerRef = useRef<HTMLDivElement>();
  const bottomRef = useRef<HTMLDivElement>();
  const renderVaultIds = useMemo(() => vaults.slice(0, renderCount), [vaults, renderCount]);
  const remainingVaults = useMemo(() => {
    return Math.max(0, totalVaults - renderCount);
  }, [totalVaults, renderCount]);

  // Render more vaults on intersection (won't trigger again until placeholder is {75 * 2}px off screen)
  const onIntersection = useCallback(
    inView => {
      if (inView && remainingVaults > 0) {
        const batchSize =
          minBatchSize +
          Math.ceil((window.scrollY - bottomRef.current.offsetTop + window.innerHeight) / 75);
        setRenderCount(count => count + Math.max(0, Math.min(batchSize, totalVaults - count)));
      }
    },
    [totalVaults, setRenderCount, minBatchSize, remainingVaults]
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
            Math.ceil((window.scrollY - bottomRef.current.offsetTop + window.innerHeight) / 75);
          setRenderCount(count => count + Math.max(0, Math.min(batchSize, totalVaults - count)));
        }
      }, 100),
    [totalVaults, setRenderCount, minBatchSize, remainingVaults]
  );

  // Get notified when the placeholder is {75 * 2}px from entering the screen
  const [placeholderRef] = useInView({
    onChange: onIntersection,
    rootMargin: `0px 0px ${75 * 2}px 0px`,
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
        {renderVaultIds.map(vault => {
          return <Vault key={vault.id} vaultId={vault.id} />;
        })}
      </div>
      <div ref={bottomRef} />
      <div ref={placeholderRef} />
    </>
  );
});
