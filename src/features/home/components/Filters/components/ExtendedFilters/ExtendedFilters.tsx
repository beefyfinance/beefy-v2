import { memo, useCallback, useState, type FC } from 'react';
import { Chains, Filter, Platforms, type FilterContentProps } from './FilterContent.tsx';
import { styled } from '@repo/styles/jsx';

export enum FilterContent {
  Filter = 1,
  Platform,
  Chains,
}

const contentToComponent: Record<FilterContent, FC<FilterContentProps>> = {
  [FilterContent.Filter]: Filter,
  [FilterContent.Platform]: Platforms,
  [FilterContent.Chains]: Chains,
};

export const ExtendedFilters = memo(function ExtendedFilters() {
  const [content, setContent] = useState<FilterContent>(FilterContent.Filter);

  const ContentComponent = contentToComponent[content];

  const handleContent = useCallback((content: FilterContent) => {
    setContent(content);
  }, []);

  return (
    <ExtendedFiltersContainer>
      <ContentComponent handleContent={handleContent} />
    </ExtendedFiltersContainer>
  );
});

const ExtendedFiltersContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
});
