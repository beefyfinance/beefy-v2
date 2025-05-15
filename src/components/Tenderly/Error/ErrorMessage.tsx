import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { selectTenderlyErrorOrUndefined } from '../../../features/data/selectors/tenderly.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { AlertError } from '../../Alerts/Alerts.tsx';

export type ErrorProps = {
  css?: CssStyles;
};

export const ErrorMessage = memo(function Error({ css: cssProp }: ErrorProps) {
  const error = useAppSelector(selectTenderlyErrorOrUndefined);

  return (
    <AlertError css={cssProp}>
      {error ? `${error.name}: ${error.message || 'unknown error'}` : 'unknown error'}
    </AlertError>
  );
});
