import { memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms.ts';
import { selectFilterPlatformIds } from '../../../../../data/selectors/filtered-vaults.ts';
import type { PlatformEntity } from '../../../../../data/entities/platform.ts';
import { MultipleSelectContent } from '../../../../../../components/Form/Select/Multi/MultipleSelectContent.tsx';

export const PlatformChecklist = memo(function PlatformChecklist() {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectFilterPlatforms);
  const options = useMemo(
    () =>
      platforms
        .map(platform => ({
          label: platform.name,
          value: platform.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [platforms]
  );

  const platformsIds = useAppSelector(selectFilterPlatformIds);
  const [activeIndex] = useState<number | null>(null);

  const handleChange = useCallback(
    (selected: PlatformEntity['id'][]) => {
      dispatch(
        filteredVaultsActions.setPlatformIds(
          selected.length === platformsIds.length ? [] : selected
        )
      );
    },
    [dispatch, platformsIds]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      onClick: () => {
        const option = options[index];
        if (option) {
          const newSelected =
            platformsIds.includes(option.value) ?
              platformsIds.filter(id => id !== option.value)
            : [...platformsIds, option.value];
          handleChange(newSelected);
        }
      },
    }),
    [options, platformsIds, handleChange]
  );

  const setListRefs = useMemo(
    () =>
      Array.from({ length: options.length }, () => () => {
        // We don't need to store refs for this implementation
      }),
    [options.length]
  );

  const allSelected = platformsIds.length === options.length;
  const noneSelected = platformsIds.length === 0;

  return (
    <MultipleSelectContent
      options={options}
      selected={platformsIds}
      activeIndex={activeIndex}
      allSelected={allSelected}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={setListRefs}
      searchEnabled={true}
    />
  );
});
