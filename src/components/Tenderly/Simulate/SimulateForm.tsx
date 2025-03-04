import { memo, useCallback } from 'react';
import { TechLoader } from '../../TechLoader/TechLoader.tsx';
import { useAppDispatch, useAppSelector } from '../../../store.ts';
import { selectTenderlyStatus } from '../../../features/data/selectors/tenderly.ts';
import { Button } from '../../Button/Button.tsx';
import { tenderlyOpenLogin } from '../../../features/data/reducers/tenderly.ts';
import { VerticalLayout } from '../Layout/VerticalLayout.tsx';
import { ErrorMessage } from '../Error/ErrorMessage.tsx';

export const SimulateForm = memo(function CallsForm() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectTenderlyStatus);
  const handleEditCredentials = useCallback(() => {
    dispatch(tenderlyOpenLogin());
  }, [dispatch]);

  if (status === 'pending') {
    return <TechLoader text={'Simulating...'} />;
  }

  return (
    <VerticalLayout>
      <ErrorMessage />
      <Button variant={'default'} onClick={handleEditCredentials}>
        Edit Credentials
      </Button>
    </VerticalLayout>
  );
});
