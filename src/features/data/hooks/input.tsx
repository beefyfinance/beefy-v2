import { useCallback, useMemo, useState } from 'react';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { AmountInputProps } from '../../vault/components/Actions/Transact/AmountInput/AmountInput.tsx';
import BigNumber from 'bignumber.js';

export function useInputForm(balance: BigNumber, decimals: number) {
  const [amount, setAmount] = useState(BIG_ZERO);
  const [max, setMax] = useState(false);

  const handleChange = useCallback<NonNullable<AmountInputProps['onChange']>>(
    (value, isMax) => {
      if (!amount.isEqualTo(value)) {
        setAmount(value.decimalPlaces(decimals, BigNumber.ROUND_FLOOR));
      }

      if (isMax !== max) {
        setMax(isMax);
      }
    },
    [amount, decimals, max]
  );

  const handleMax = useCallback(() => {
    setMax(true);
    setAmount(balance);
  }, [balance]);

  return useMemo(() => {
    return { formData: { amount, max }, handleChange, handleMax };
  }, [amount, handleChange, handleMax, max]);
}
