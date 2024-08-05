import React, { memo, useCallback } from 'react';
import { TechLoader } from '../../TechLoader';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectTenderlyStatus } from '../../../features/data/selectors/tenderly';
import { Button } from '../../Button';
import { tenderlyOpenLogin } from '../../../features/data/reducers/tenderly';
import { VerticalLayout } from '../Layout/VerticalLayout';
import { ErrorMessage } from '../Error/ErrorMessage';

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
      <Button variant={'light'} onClick={handleEditCredentials}>
        Edit Credentials
      </Button>
    </VerticalLayout>
  );
});
