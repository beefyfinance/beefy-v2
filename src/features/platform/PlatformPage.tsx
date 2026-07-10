import { styled } from '@repo/styles/jsx';
import { lazy, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  return <PlatformContent key={idOrStatus} platformId={idOrStatus} />;
});

type PlatformContentProps = {
  platformId: PlatformEntity['id'];
};

const PlatformContent = memo(function PlatformContent({ platformId }: PlatformContentProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const platform = useAppSelector(state => selectPlatformById(state, platformId));
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
      <PageLayout
        header={
          <Container maxWidth="lg">
            <Title>{t('Meta-Platform-Title', { platform: platform.name })}</Title>
          </Container>
        }
        content={
          <Content>
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
    paddingBlock: '12px',
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
