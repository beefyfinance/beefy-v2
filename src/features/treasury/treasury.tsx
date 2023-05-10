import { makeStyles } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTreasury } from '../data/actions/treasury';
import { selectIsTreasuryLoaded, selectShouldInitTreasury } from '../data/selectors/treasury';
import { DaoExposure } from './components/DaoExposure';
import { DaoHoldings } from './components/DaoHoldings';
import { DaoSummary } from './components/DaoSummary';
import { styles } from './styles';
import { TechLoader } from '../../components/TechLoader';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export const Treasury = memo(function Treasury() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const shouldInit = useAppSelector(selectShouldInitTreasury);
  const isLoaded = useAppSelector(selectIsTreasuryLoaded);
  const isAddressBookLoaded = useAppSelector(
    state => state.ui.dataLoader.global.addressBook.alreadyLoadedOnce
  );
  const vaultsLoaded = useAppSelector(state => state.ui.dataLoader.global.vaults.alreadyLoadedOnce);

  useEffect(() => {
    if (shouldInit) {
      dispatch(fetchTreasury());
    }
  }, [dispatch, shouldInit]);

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
