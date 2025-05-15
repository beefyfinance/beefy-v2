import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { VaultDepositTokenImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { extractTagFromLpSymbol } from '../../../../../../helpers/tokens.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchMode } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectDepositTokenByVaultId } from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';

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
    dispatch(transactSwitchMode(TransactMode.Boost));
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
