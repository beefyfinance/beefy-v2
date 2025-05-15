import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ToggleButtonItem } from '../../../../components/ToggleButtons/ToggleButtons.tsx';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { fetchAddressBookAction } from '../../../data/actions/tokens.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectHasBreakdownDataForVault,
  selectLpBreakdownForVault,
  selectShouldInitAddressBook,
} from '../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { Card } from '../Card/Card.tsx';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { CardTitle } from '../Card/CardTitle.tsx';
import { StatSwitcher } from '../StatSwitcher/StatSwitcher.tsx';
import { BreakdownTable } from './components/BreakdownTable/BreakdownTable.tsx';
import { ChartWithLegend } from './components/ChartWithLegend/ChartWithLegend.tsx';
import { useCalculatedBreakdown } from './hooks.ts';
import type { BreakdownMode } from './types.ts';

export type LiquidityPoolBreakdownProps = {
  vaultId: VaultEntity['id'];
};
export const LiquidityPoolBreakdown = memo<LiquidityPoolBreakdownProps>(
  function LiquidityPoolBreakdown({ vaultId }) {
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const breakdown = useAppSelector(state => selectLpBreakdownForVault(state, vault));
    const calculatedBreakdown = useCalculatedBreakdown(vault, breakdown);
    const { userBalance } = calculatedBreakdown;
    const [tab, setTab] = useState<BreakdownMode>(userBalance.gt(BIG_ZERO) ? 'user' : 'total');
    const [haveSwitchedTab, setHaveSwitchedTab] = useState(false);
    const isForCowcentrated = isCowcentratedLikeVault(vault);

    const tabs = useMemo(() => {
      const options: Array<ToggleButtonItem<BreakdownMode>> = [];
      if (userBalance.gt(BIG_ZERO)) {
        options.push({ value: 'user', label: t('Vault-LpBreakdown-YourDeposit') });
      }
      options.push({ value: 'one', label: t('Vault-LpBreakdown-1LP') });
      options.push({
        value: 'total',
        label: t(isForCowcentrated ? 'Vault-LpBreakdown-ClmPool' : 'Vault-LpBreakdown-TotalPool'),
      });
      if (isForCowcentrated) {
        options.push({ value: 'underlying', label: t('Vault-LpBreakdown-Underlying') });
      }
      return options;
    }, [userBalance, t, isForCowcentrated]);

    const onTabChange = useCallback(
      (newTab: BreakdownMode) => {
        setTab(newTab);
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
        <CardHeader>
          <CardTitle>{'LP Breakdown'}</CardTitle>
          <StatSwitcher<BreakdownMode> onChange={onTabChange} options={tabs} stat={tab} />
        </CardHeader>
        <StyledCardContent>
          <ChartWithLegend breakdown={calculatedBreakdown} tab={tab} />
          <BreakdownTable mode={tab} breakdown={calculatedBreakdown} />
        </StyledCardContent>
      </Card>
    );
  }
);

const StyledCardContent = styled(CardContent, {
  base: {
    padding: 0,
    sm: {
      padding: 0,
    },
    lg: {
      display: 'grid',
      gridTemplateColumns: '232fr 484fr',
    },
  },
});

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
