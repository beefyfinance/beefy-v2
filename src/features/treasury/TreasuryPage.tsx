import { legacyMakeStyles } from '../../helpers/mui.ts';
import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store.ts';
import { fetchTreasury } from '../data/actions/treasury.ts';
import { selectIsTreasuryLoaded, selectShouldInitTreasury } from '../data/selectors/treasury.ts';
import { DaoExposure } from './components/DaoExposure/DaoExposure.tsx';
import { DaoHoldings } from './components/DaoHoldings/DaoHoldings.tsx';
import { DaoSummary } from './components/DaoSummary/DaoSummary.tsx';
import { styles } from './styles.ts';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { useTranslation } from 'react-i18next';
import {
  selectIsAddressBookLoadedGlobal,
  selectIsVaultsAvailable,
} from '../data/selectors/data-loader.ts';

const useStyles = legacyMakeStyles(styles);

const TreasuryPage = memo(function TreasuryPage() {
  const { t } = useTranslation();
  const classes = useStyles();
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
    <div className={classes.treasury}>
      <DaoSummary />
      <DaoExposure />
      <DaoHoldings />
    </div>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default TreasuryPage;
