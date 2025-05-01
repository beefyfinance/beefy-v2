import { memo } from 'react';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { TableHeaderSort } from './TableHeaderSort.tsx';
import { DropdownSort } from './DropdownSort.tsx';

export const VaultsSort = memo(function VaultsSort() {
  const sortColumns = useBreakpoint({ from: 'lg' });
  return sortColumns ? <TableHeaderSort /> : <DropdownSort />;
});
