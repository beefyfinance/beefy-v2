import { makeStyles } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTreasury } from '../data/actions/treasury';
import { selectIsTreasuryLoaded, selectShouldInitTreasury } from '../data/selectors/treasury';
import { DaoExposure } from './components/DaoExposure';
import { DaoHoldings } from './components/DaoHoldings';
import { DaoSummary } from './components/DaoSummary';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Treasury = memo(function () {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const shouldInit = useAppSelector(selectShouldInitTreasury);
  const isLoaded = useAppSelector(selectIsTreasuryLoaded);
  const isAddressBookLoaded = useAppSelector(
    state => state.ui.dataLoader.global.addressBook.alreadyLoadedOnce
  );

  useEffect(() => {
    if (shouldInit) {
      dispatch(fetchTreasury());
    }
  }, [dispatch, shouldInit]);

  if (!isLoaded && !isAddressBookLoaded) {
    return <div>Loading ...</div>;
  }

  return (
    <div className={classes.treasury}>
      <DaoSummary />
      <DaoExposure />
      <DaoHoldings />
    </div>
  );
});
