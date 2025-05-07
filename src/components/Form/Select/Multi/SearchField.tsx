import { memo } from 'react';
import { SearchInput, type SearchInputProps } from '../../Input/SearchInput.tsx';

type SearchFieldProps = Pick<SearchInputProps, 'value' | 'onValueChange' | 'placeholder'>;

export const SearchField = memo(function (props: SearchFieldProps) {
  return <SearchInput {...props} />;
});
