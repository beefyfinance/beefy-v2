import { useCallback, useState } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import type { AmountInputProps } from '../../Transact/AmountInput';
import BigNumber from 'bignumber.js';

export function useInputForm(balance: BigNumber, decimals: number) {
  const [formData, setFormData] = useState({ amount: BIG_ZERO, max: false });

  const handleChange = useCallback<AmountInputProps['onChange']>(
    (value, isMax) => {
      setFormData({ amount: value.decimalPlaces(decimals, BigNumber.ROUND_FLOOR), max: isMax });
    },
    [decimals]
  );

  const handleMax = useCallback(() => {
    setFormData({ amount: balance, max: true });
  }, [balance]);

  console.log(formData.amount.toFixed(18));

  return { formData, handleChange, handleMax };
}
