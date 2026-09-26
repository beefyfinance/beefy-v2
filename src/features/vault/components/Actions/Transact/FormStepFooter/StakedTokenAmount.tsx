import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { VaultDepositTokenImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { extractTagFromLpSymbol } from '../../../../../../helpers/tokens.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectDepositTokenByVaultId } from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export type StakedTokenAmountProps = {
  vaultId: VaultEntity['id'];
  amount: BigNumber;
};

/** The `<Token/>` run shared by both boost withdraw notices: amount, symbol, icon */
export const StakedTokenAmount = memo(function StakedTokenAmount({
  vaultId,
  amount,
}: StakedTokenAmountProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const symbol = extractTagFromLpSymbol([depositToken], vault)?.tag || depositToken.symbol;

  return (
    <Inline>
      <TokenAmount amount={amount} decimals={depositToken.decimals} />
      {symbol}
      <VaultDepositTokenImage vault={vault} size={24} />
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
