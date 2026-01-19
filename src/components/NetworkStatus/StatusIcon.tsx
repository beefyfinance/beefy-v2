import { memo } from 'react';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { selectLoaderStatus } from '../../features/data/selectors/data-loader-helpers.ts';
import { PulseHighlight } from '../../features/vault/components/PulseHighlight/PulseHighlight.tsx';

export const StatusIcon = memo(function StatusIcon() {
  const status = useAppSelector(selectLoaderStatus);
  const statusError = status.rejected;
  const statusAttention = status.rejected || status.pending;

  return (
    <PulseHighlight
      variant={statusError ? 'warning' : 'success'}
      state={statusAttention ? 'playing' : 'stopped'}
    />
  );
});
