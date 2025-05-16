import { memo } from 'react';
import { selectTenderlyStatus } from '../../../features/data/selectors/tenderly.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { TechLoader } from '../../TechLoader/TechLoader.tsx';
import { ErrorMessage } from '../Error/ErrorMessage.tsx';

export const CallsForm = memo(function CallsForm() {
  const status = useAppSelector(selectTenderlyStatus);

  if (status === 'pending') {
    return <TechLoader text={'Building txs...'} />;
  }

  return <ErrorMessage />;
});
