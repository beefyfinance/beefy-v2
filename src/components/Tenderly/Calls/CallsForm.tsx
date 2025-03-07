import { memo } from 'react';
import { TechLoader } from '../../TechLoader/TechLoader.tsx';
import { useAppSelector } from '../../../store.ts';
import { selectTenderlyStatus } from '../../../features/data/selectors/tenderly.ts';
import { ErrorMessage } from '../Error/ErrorMessage.tsx';

export const CallsForm = memo(function CallsForm() {
  const status = useAppSelector(selectTenderlyStatus);

  if (status === 'pending') {
    return <TechLoader text={'Building txs...'} />;
  }

  return <ErrorMessage />;
});
