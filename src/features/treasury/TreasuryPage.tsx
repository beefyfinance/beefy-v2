import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { useAppDispatch, useAppSelector } from '../data/store/hooks.ts';
import { fetchTreasury } from '../data/actions/treasury.ts';
import { selectIsVaultsAvailable } from '../data/selectors/data-loader/config.ts';
import { DaoExposure } from './components/DaoExposure/DaoExposure.tsx';
import { DaoHoldings } from './components/DaoHoldings/DaoHoldings.tsx';
import { DaoSummary } from './components/DaoSummary/DaoSummary.tsx';
import {
  selectIsTreasuryLoaded,
  selectShouldInitTreasury,
} from '../data/selectors/data-loader/treasury.ts';
import { selectIsAddressBookLoadedGlobal } from '../data/selectors/data-loader/tokens.ts';
import { styled } from '@repo/styles/jsx';

const TreasuryPage = memo(function TreasuryPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const shouldInit = useAppSelector(selectShouldInitTreasury);
  const isLoaded = useAppSelector(selectIsTreasuryLoaded);
  const isAddressBookLoaded = useAppSelector(selectIsAddressBookLoadedGlobal);
  const vaultsLoaded = useAppSelector(selectIsVaultsAvailable);

  useEffect(() => {
    if (shouldInit && isAddressBookLoaded && vaultsLoaded) {
      dispatch(fetchTreasury());
    }
  }, [dispatch, shouldInit, isAddressBookLoaded, vaultsLoaded]);

  if (!isLoaded || !isAddressBookLoaded || !vaultsLoaded) {
    return <TechLoader text={t('Treasury-Loading')} />;
  }

  return (
    <TreasuryContainer>
      <DaoSummary />
      <Content>
        <DaoExposure />
        <DaoHoldings />
      </Content>
    </TreasuryContainer>
  );
});

const TreasuryContainer = styled('div', {
  base: {
    flex: '1 1 auto',
    backgroundColor: 'background.header',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 20px',
    backgroundColor: 'background.body',
    borderRadius: '20px',
    flexGrow: 1,
    sm: {
      paddingBlock: '14px 32px',
      borderRadius: '24px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default TreasuryPage;
