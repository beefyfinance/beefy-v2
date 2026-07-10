import { styled } from '@repo/styles/jsx';
import { lazy, memo, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Container } from '../../components/Container/Container.tsx';
import { PlatformMeta } from '../../components/Meta/PlatformMeta.tsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';
import { useAppDispatch, useAppSelector } from '../data/store/hooks.ts';
import { type PlatformEntity } from '../data/entities/platform.ts';
import { filteredVaultsActions } from '../data/reducers/filtered-vaults.ts';
import { selectFilterPlatformIds } from '../data/selectors/filtered-vaults.ts';
import {
  selectPlatformById,
  selectPlatformIdForPlatformPage,
} from '../data/selectors/platforms.ts';
import { Filters } from '../home/components/Filters/Filters.tsx';
import { Loading } from '../home/components/Loading/Loading.tsx';
import { Vaults } from '../home/components/Vaults/Vaults.tsx';

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

  return <PlatformContent platformId={idOrStatus} />;
});

type PlatformContentProps = {
  platformId: PlatformEntity['id'];
};

const PlatformContent = memo(function PlatformContent({ platformId }: PlatformContentProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const platform = useAppSelector(state => selectPlatformById(state, platformId));
  const platformIds = useAppSelector(selectFilterPlatformIds);
  const syncedRef = useRef(false);

  useEffect(() => {
    dispatch(filteredVaultsActions.reset({ platformIds: [platformId] }));
    syncedRef.current = false;
  }, [dispatch, platformId]);

  // exit to home (keeping filters) if the platform filter no longer matches the url
  useEffect(() => {
    if (platformIds.length === 1 && platformIds[0] === platformId) {
      syncedRef.current = true;
    } else if (syncedRef.current) {
      navigate('/', { replace: true });
    }
  }, [navigate, platformIds, platformId]);

  return (
    <>
      <PlatformMeta platformId={platformId} />
      <PageLayout
        content={
          <Content>
            <Container maxWidth="lg">
              <Title>{platform.name}</Title>
            </Container>
            <Container maxWidth="lg">
              <Filters />
            </Container>
            <Vaults />
          </Content>
        }
      />
    </>
  );
});

const Title = styled('h1', {
  base: {
    textStyle: 'h1',
    color: 'text.light',
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 24px',
    sm: {
      paddingBlock: '12px 28px',
      borderRadius: '24px',
    },
    lg: {
      paddingBlock: '12px 48px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default PlatformPage;
