import { lazy, memo, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { PlatformMeta } from '../../components/Meta/PlatformMeta.tsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';
import { useAppDispatch, useAppSelector } from '../data/store/hooks.ts';
import { type PlatformEntity } from '../data/entities/platform.ts';
import { filteredVaultsActions } from '../data/reducers/filtered-vaults.ts';
import { selectFilterPlatformIds } from '../data/selectors/filtered-vaults.ts';
import { selectPlatformIdForPlatformPage } from '../data/selectors/platforms.ts';
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const platformIds = useAppSelector(selectFilterPlatformIds);
  const isPreset = platformIds.length === 1 && platformIds[0] === platformId;
  // only render once the preset has been applied, so persisted filters never paint
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    dispatch(filteredVaultsActions.reset({ platformIds: [platformId] }));
  }, [dispatch, platformId]);

  // exit to home (keeping filters) if the platform filter no longer matches the url
  useEffect(() => {
    if (isPreset) {
      setSynced(true);
    } else if (synced) {
      navigate('/', { replace: true });
    }
  }, [isPreset, synced, navigate]);

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
