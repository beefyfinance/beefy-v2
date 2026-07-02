import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { AmountInputWithSlider } from '../AmountInputWithSlider/AmountInputWithSlider.tsx';
import { useVaultShareTokenInput } from '../hooks/useVaultShareTokenInput.ts';
import { TokenSelectButton } from '../TokenSelectButton/TokenSelectButton.tsx';

export type WithdrawTokenAmountInputProps = {
  css?: CssStyles;
};

export const WithdrawTokenAmountInput = memo(function WithdrawTokenAmountInput({
  css: cssProp,
}: WithdrawTokenAmountInputProps) {
  const vaultId = useAppSelector(selectTransactVaultId);
  const { value, maxValue, price, tokenDecimals, onChange } = useVaultShareTokenInput(vaultId, 0);

  return (
    <AmountInputWithSlider
      css={cssProp}
      value={value}
      maxValue={maxValue}
      onChange={onChange}
      price={price}
      tokenDecimals={tokenDecimals}
      endAdornment={<TokenSelectButton index={0} />}
    />
  );
});
