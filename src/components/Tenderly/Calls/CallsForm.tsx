import React, { memo } from 'react';
import { TechLoader } from '../../TechLoader';
import { useAppSelector } from '../../../store';
import { selectTenderlyStatus } from '../../../features/data/selectors/tenderly';
import { ErrorMessage } from '../Error/ErrorMessage';

export const CallsForm = memo(function CallsForm() {
  const status = useAppSelector(selectTenderlyStatus);

  if (status === 'pending') {
    return <TechLoader text={'Building txs...'} />;
  }

  return <ErrorMessage />;
});
