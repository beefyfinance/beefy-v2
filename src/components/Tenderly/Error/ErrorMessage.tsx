import React, { memo } from 'react';
import { AlertError } from '../../Alerts';
import { useAppSelector } from '../../../store';
import { selectTenderlyErrorOrUndefined } from '../../../features/data/selectors/tenderly';

export type ErrorProps = {
  className?: string;
};

export const ErrorMessage = memo<ErrorProps>(function Error({ className }) {
  const error = useAppSelector(selectTenderlyErrorOrUndefined);

  return (
    <AlertError className={className}>
      {error ? `${error.name}: ${error.message || 'unknown error'}` : 'unknown error'}
    </AlertError>
  );
});
