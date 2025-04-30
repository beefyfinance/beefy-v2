import { memo, useCallback, useMemo, useState, type FC } from 'react';
import { Filter, type FilterContentProps } from './FilterContent.tsx';
import { styled } from '@repo/styles/jsx';
import { FilterContent } from './types.ts';
import { Chains } from './ChainsContent.tsx';
import { Platforms } from './PlatformsContent.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

const contentToComponent: Record<FilterContent, FC<FilterContentProps>> = {
  [FilterContent.Filter]: Filter,
  [FilterContent.Platform]: Platforms,
  [FilterContent.Chains]: Chains,
};

export const ExtendedFilters = memo(function ExtendedFilters() {
  const desktop = useBreakpoint({ from: 'lg' });
  const [content, setContent] = useState<FilterContent>(FilterContent.Filter);

  const ContentComponent = contentToComponent[content];

  const handleContent = useCallback((content: FilterContent) => {
    setContent(content);
  }, []);

  const mustUseCustomPadding = useMemo(
    () => desktop && content === FilterContent.Platform,
    [content, desktop]
  );

  return (
    <ExtendedFiltersContainer customPadding={mustUseCustomPadding}>
      <ContentComponent handleContent={handleContent} />
    </ExtendedFiltersContainer>
  );
});

const ExtendedFiltersContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    padding: '16px 12px',
    lg: {
      rowGap: '12px',
    },
  },
  variants: {
    customPadding: {
      true: {
        padding: '16px 12px 0px 12px',
      },
    },
  },
});
