import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { BreakdownTable } from './components/BreakdownTable';
import type { BreakdownMode } from './types';
import { ChartWithLegend } from './components/ChartWithLegend';
import { useCalculatedBreakdown } from './hooks';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectIsVaultCowcentratedLike, selectVaultById } from '../../../data/selectors/vaults';
import type { TokenLpBreakdown } from '../../../data/entities/token';
import {
  selectHasBreakdownDataByTokenAddress,
  selectLpBreakdownForVault,
} from '../../../data/selectors/tokens';
import { type VaultEntity } from '../../../data/entities/vault';
import {
  selectIsAddressBookLoaded,
  selectShouldInitAddressBook,
} from '../../../data/selectors/data-loader';
import { fetchAddressBookAction } from '../../../data/actions/tokens';
import { StatSwitcher } from '../StatSwitcher';

const useStyles = makeStyles(styles);

export type LiquidityPoolBreakdownProps = {
  vault: VaultEntity;
  breakdown: TokenLpBreakdown;
};
export const LiquidityPoolBreakdown = memo<LiquidityPoolBreakdownProps>(
  function LiquidityPoolBreakdown({ vault, breakdown }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const isCowcentratedLike = useAppSelector(state =>
      selectIsVaultCowcentratedLike(state, vault.id)
    );
    const calculatedBreakdown = useCalculatedBreakdown(vault, breakdown);
    const { userBalance } = calculatedBreakdown;
    const [tab, setTab] = useState<BreakdownMode>(userBalance.gt(BIG_ZERO) ? 'user' : 'total');
    const [haveSwitchedTab, setHaveSwitchedTab] = useState(false);
    const isForCowcentrated = !!isCowcentratedLike;

    const tabs: Partial<Record<BreakdownMode, string>> = useMemo(() => {
      const map = {};
      if (userBalance.gt(BIG_ZERO)) {
        map['user'] = t('Vault-LpBreakdown-YourDeposit');
      }
      map['one'] = t('Vault-LpBreakdown-1LP');
      map['total'] = t(
        isForCowcentrated ? 'Vault-LpBreakdown-ClmPool' : 'Vault-LpBreakdown-TotalPool'
      );
      if (isForCowcentrated) {
        map['underlying'] = t('Vault-LpBreakdown-Underlying');
      }
      return map;
    }, [userBalance, t, isForCowcentrated]);

    const onTabChange = useCallback(
      (newTab: string) => {
        setTab(newTab as BreakdownMode);
        setHaveSwitchedTab(true);
      },
      [setTab, setHaveSwitchedTab]
    );

    // Switch to 'Your Deposit' tab if user has balance and has not interacted with tabs
    useEffect(() => {
      if (userBalance.gt(BIG_ZERO) && !haveSwitchedTab && tab !== 'user') {
        onTabChange('user');
      }
    }, [userBalance, haveSwitchedTab, onTabChange, tab]);

    return (
      <Card>
        <CardHeader className={classes.header}>
          <CardTitle title={'LP Breakdown'} />
          <StatSwitcher onChange={onTabChange} options={tabs} stat={tab} />
        </CardHeader>
        <CardContent disableDefaultClass={true} className={classes.layout}>
          <ChartWithLegend breakdown={calculatedBreakdown} tab={tab} />
          <BreakdownTable mode={tab} breakdown={calculatedBreakdown} />
        </CardContent>
      </Card>
    );
  }
);

type LiquidityPoolBreakdownLoaderProps = {
  vaultId: VaultEntity['id'];
};
export const LiquidityPoolBreakdownLoader = memo<LiquidityPoolBreakdownLoaderProps>(
  function LiquidityPoolBreakdownLoader({ vaultId }) {
    const dispatch = useAppDispatch();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const chainId = vault.chainId;
    const isAddressBookLoaded = useAppSelector(state => selectIsAddressBookLoaded(state, chainId));

    const shouldInitAddressBook = useAppSelector(state =>
      selectShouldInitAddressBook(state, chainId)
    );
    const breakdown = useAppSelector(state => selectLpBreakdownForVault(state, vault));
    const haveBreakdownData = useAppSelector(state =>
      selectHasBreakdownDataByTokenAddress(state, vault.depositTokenAddress, vault.chainId)
    );

    // Load address book if needed
    useEffect(() => {
      if (!isAddressBookLoaded && shouldInitAddressBook) {
        dispatch(fetchAddressBookAction({ chainId: chainId }));
      }
    }, [dispatch, isAddressBookLoaded, shouldInitAddressBook, chainId]);

    if (haveBreakdownData) {
      return <LiquidityPoolBreakdown vault={vault} breakdown={breakdown} />;
    }

    return null;
  }
);
