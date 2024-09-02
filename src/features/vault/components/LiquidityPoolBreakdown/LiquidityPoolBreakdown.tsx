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
import { selectVaultById } from '../../../data/selectors/vaults';
import {
  selectHasBreakdownDataForVault,
  selectLpBreakdownForVault,
} from '../../../data/selectors/tokens';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../data/entities/vault';
import { selectShouldInitAddressBook } from '../../../data/selectors/data-loader';
import { fetchAddressBookAction } from '../../../data/actions/tokens';
import { StatSwitcher } from '../StatSwitcher';

const useStyles = makeStyles(styles);

export type LiquidityPoolBreakdownProps = {
  vaultId: VaultEntity['id'];
};
export const LiquidityPoolBreakdown = memo<LiquidityPoolBreakdownProps>(
  function LiquidityPoolBreakdown({ vaultId }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const breakdown = useAppSelector(state => selectLpBreakdownForVault(state, vault));
    const calculatedBreakdown = useCalculatedBreakdown(vault, breakdown);
    const { userBalance } = calculatedBreakdown;
    const [tab, setTab] = useState<BreakdownMode>(userBalance.gt(BIG_ZERO) ? 'user' : 'total');
    const [haveSwitchedTab, setHaveSwitchedTab] = useState(false);
    const isForCowcentrated = isCowcentratedLikeVault(vault);

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
    const haveBreakdownData = useAppSelector(state => selectHasBreakdownDataForVault(state, vault));
    const shouldInitAddressBook = useAppSelector(state =>
      selectShouldInitAddressBook(state, chainId)
    );

    // Load address book if needed
    useEffect(() => {
      if (shouldInitAddressBook) {
        dispatch(fetchAddressBookAction({ chainId }));
      }
    }, [dispatch, shouldInitAddressBook, chainId]);

    if (haveBreakdownData) {
      return <LiquidityPoolBreakdown vaultId={vaultId} />;
    }

    return null;
  }
);
