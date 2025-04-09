import { useCallback, useMemo } from 'react';
import {
  selectVaultUserBalanceInDepositTokenBreakdown,
  type UserVaultBalanceBreakdownBoost,
  type UserVaultBalanceBreakdownEntry,
} from '../../../../../data/selectors/balance.ts';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { styled } from '@repo/styles/jsx';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults.ts';
import { useTranslation } from 'react-i18next';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectErc20TokenByAddress } from '../../../../../data/selectors/tokens.ts';
import { extractTagFromLpSymbol } from '../../../../../../helpers/tokens.ts';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';

const typesToShow = ['boost'] as const satisfies Array<UserVaultBalanceBreakdownEntry['type']>;

export const WithdrawBoostNotice = memo(function WithdrawBoostNotice() {
  const vaultId = useAppSelector(selectTransactVaultId);

  const breakdown = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
  );

  const entriesToShow = useMemo(() => {
    return breakdown.entries.filter((entry): entry is UserVaultBalanceBreakdownBoost =>
      typesToShow.some(type => type === entry.type)
    );
  }, [breakdown.entries]);

  const boostsBalance = useMemo(() => {
    return entriesToShow.reduce((acc, curr) => acc.plus(curr.amount), BIG_ZERO);
  }, [entriesToShow]);

  if (boostsBalance.gt(BIG_ZERO)) {
    return <BoostBalance balance={boostsBalance} vaultId={vaultId} />;
  }

  return null;
});

const BoostBalance = memo(function BoostBalance({
  balance,
  vaultId,
}: {
  balance: BigNumber;
  vaultId: VaultEntity['id'];
}) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectStandardVaultById(state, vaultId));
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const dispatch = useAppDispatch();

  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  const vaultSymbol = useMemo(() => {
    const symbol = extractTagFromLpSymbol([depositToken], vault);

    if (symbol.tag) {
      return symbol.tag;
    }

    return depositToken.symbol;
  }, [depositToken, vault]);

  return (
    <WithdrawBoostContainer onClick={handleTab}>
      <FlexContainer>
        <TokenAmount amount={balance} decimals={mooToken.decimals} /> {vaultSymbol}
        <VaultIcon vaultId={vault.id} size={24} />
      </FlexContainer>
      <FlexContainer>
        {t('Boost-Unstake-Notice')}
        <ChevronRight />
      </FlexContainer>
    </WithdrawBoostContainer>
  );
});

const WithdrawBoostContainer = styled('button', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 16px 8px 16px',
    color: 'text.dark',
    background: 'buttons.boost.background',
    borderRadius: '0px 0px 12px 12px',
    width: '100%',
    sm: {
      padding: '6px 24px 8px 24px',
    },
    '&:hover': {
      background: 'buttons.boost.active.background',
    },
  },
});

const FlexContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});
