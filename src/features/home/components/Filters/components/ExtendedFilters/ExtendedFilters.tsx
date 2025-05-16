import { memo, useCallback, useMemo, type FC } from 'react';
import { Filter, type FilterContentProps } from './FilterContent.tsx';
import { styled } from '@repo/styles/jsx';
import { Chains } from './ChainsContent.tsx';
import { Platforms } from './PlatformsContent.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterContent } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';

const contentToComponent: Record<FilterContent, FC<FilterContentProps>> = {
  [FilterContent.Filter]: Filter,
  [FilterContent.Platform]: Platforms,
  [FilterContent.Chains]: Chains,
};

export const ExtendedFilters = memo(function ExtendedFilters() {
  const desktop = useBreakpoint({ from: 'lg' });
  const content = useAppSelector(selectFilterContent);
  const dispatch = useAppDispatch();
  const ContentComponent = contentToComponent[content];

  const handleContent = useCallback(
    (content: FilterContent) => {
      dispatch(filteredVaultsActions.setFilterContent(content));
    },
    [dispatch]
  );

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
    padding: '10px 12px',
    lg: {
      padding: '16px',
    },
  },
  variants: {
    customPadding: {
      true: {
        lg: {
          padding: '16px 16px 0px 16px',
        },
      },
    },
  },
});
