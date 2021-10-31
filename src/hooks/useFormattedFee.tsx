import { useEffect, useState } from 'react';

const useFormattedFee = fee => {
  const [formattedFee, setFormattedFee] = useState('0%');

  useEffect(() => {
    const feeAsPercent = fee * 100;
    const newFormattedFee = `${feeAsPercent.toString()}%`;
    setFormattedFee(newFormattedFee);
  }, [fee]);

  return formattedFee;
};

export default useFormattedFee;
