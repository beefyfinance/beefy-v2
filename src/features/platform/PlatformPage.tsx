import { lazy, memo, useEffect, useMemo, useRef } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { PlatformMeta } from '../../components/Meta/PlatformMeta.tsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';
import { useAppSelector } from '../data/store/hooks.ts';
import { type PlatformEntity } from '../data/entities/platform.ts';
import { useFilterUrlSync } from '../data/hooks/filter-url-sync.ts';
import type { FilteredVaultsPreset } from '../data/reducers/filtered-vaults-types.ts';
import { selectFilterOptions, selectFilterPlatformIds } from '../data/selectors/filtered-vaults.ts';
import { selectPlatformIdForPlatformPage } from '../data/selectors/platforms.ts';
import { parseFilterSearch, serializeFilters } from '../data/utils/filter-url.ts';
import { HomeContent } from '../home/HomePage.tsx';
import { Loading } from '../home/components/Loading/Loading.tsx';

const NotFoundPage = lazy(() => import('../pagenotfound/NotFoundPage.tsx'));

type PlatformUrlParams = {
  platformId: PlatformEntity['id'];
};

const PlatformPage = memo(function PlatformPage() {
  const { platformId: maybeId } = useParams<PlatformUrlParams>();
  const idOrStatus = useAppSelector(state => selectPlatformIdForPlatformPage(state, maybeId));

  if (idOrStatus === 'loading') {
    return <PageLayout content={<Loading />} />;
  } else if (idOrStatus === 'not-found') {
    return <NotFoundPage />;
  } else if (idOrStatus !== maybeId) {
    return <Navigate to={`/platform/${idOrStatus}`} replace={true} />;
  }

  return <PlatformContent key={idOrStatus} platformId={idOrStatus} />;
});

type PlatformContentProps = {
  platformId: PlatformEntity['id'];
};

const PlatformContent = memo(function PlatformContent({ platformId }: PlatformContentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const filters = useAppSelector(selectFilterOptions);
  const platformIds = useAppSelector(selectFilterPlatformIds);
  const pathPreset = useMemo<FilteredVaultsPreset>(
    () => ({ platformIds: [platformId] }),
    [platformId]
  );
  const synced = useFilterUrlSync(pathPreset);
  const isPreset = platformIds.length === 1 && platformIds[0] === platformId;
  const exitedRef = useRef(false);

  // exit to home (keeping filters) if the platform filter no longer matches the url
  useEffect(() => {
    if (synced && !isPreset && !exitedRef.current) {
      exitedRef.current = true;
      const { carry } = parseFilterSearch(location.search);
      navigate('/' + serializeFilters(filters, { carry }));
    }
  }, [synced, isPreset, navigate, filters, location.search]);

  if (!synced) {
    return <PageLayout content={<Loading />} />;
  }

  return (
    <>
      <PlatformMeta platformId={platformId} />
      <HomeContent />
    </>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default PlatformPage;
