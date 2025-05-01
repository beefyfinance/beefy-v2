import { memo } from 'react';
import { VaultsSearch } from '../VaultsSearch/VaultsSearch.tsx';
import { VaultsSort } from '../VaultsSort/VaultsSort.tsx';
import { css } from '@repo/styles/css';

export const VaultsHeader = memo(function VaultsHeader() {
  return (
    <div className={headerCss}>
      <VaultsSearch />
      <VaultsSort />
    </div>
  );
});

const headerCss = css({
  display: 'grid',
  columnGap: '24px',
  rowGap: '12px',
  width: '100%',
  color: 'text.dark',
  background: 'background.content.dark',
  padding: '16px 24px',
  gridTemplateColumns: '1fr',
  alignItems: 'center',
  backgroundClip: 'padding-box',
  sm: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    rowGap: '16px',
  },
  lg: {
    gridTemplateColumns: 'minmax(0, 40fr) minmax(0, 60fr)',
    position: 'sticky',
    top: 0,
    zIndex: '[1]',
  },
});
