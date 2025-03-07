import { memo } from 'react';
import { SearchInput, type SearchInputProps } from '../../Input/SearchInput.tsx';
import { css } from '@repo/styles/css';

type SearchFieldProps = Pick<SearchInputProps, 'value' | 'onValueChange'>;

export const SearchField = memo(function (props: SearchFieldProps) {
  const className = css({
    paddingInline: '8px',
  });

  return (
    <div className={className}>
      <SearchInput {...props} />
    </div>
  );
});
