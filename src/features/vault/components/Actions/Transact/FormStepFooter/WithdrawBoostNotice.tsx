import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { styled } from '@repo/styles/jsx';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { Trans, useTranslation } from 'react-i18next';
import { selectDepositTokenByVaultId } from '../../../../../data/selectors/tokens.ts';
import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { extractTagFromLpSymbol } from '../../../../../../helpers/tokens.ts';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';
import { VaultDepositTokenImage } from '../../../../../../components/TokenImage/TokenImage.tsx';

type WithdrawBoostNoticeProps = {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
};

const WithdrawBoostNotice = memo(function WithdrawBoostNotice({
  vaultId,
  balance,
}: WithdrawBoostNoticeProps) {
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const { t } = useTranslation();
  const inner = useMemo(() => {
    const vaultSymbol = extractTagFromLpSymbol([depositToken], vault)?.tag || depositToken.symbol;
    return (
      <Trans
        i18nKey={'Transact-Notice-Withdraw-Boost'}
        t={t}
        components={{
          Token: (
            <TokenAmountSymbolIcon
              amount={balance}
              decimals={depositToken.decimals}
              symbol={vaultSymbol}
              icon={<VaultDepositTokenImage vault={vault} size={24} />}
            />
          ),
        }}
      />
    );
  }, [depositToken, balance, vault, t]);
  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  return <ActionTokensNotice onClick={handleTab} children={inner} />;
});

type TokenAmountSymbolIconProps = {
  amount: BigNumber;
  decimals: number;
  symbol: string;
  icon: ReactNode;
};

const TokenAmountSymbolIcon = memo(function TokenAmountSymbolIcon({
  amount,
  decimals,
  symbol,
  icon,
}: TokenAmountSymbolIconProps) {
  return (
    <Inline>
      <TokenAmount amount={amount} decimals={decimals} />
      {symbol}
      {icon}
    </Inline>
  );
});

const Inline = styled('span', {
  base: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawBoostNotice;
