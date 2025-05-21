import { memo, useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms.ts';
import { selectFilterPlatformIds } from '../../../../../data/selectors/filtered-vaults.ts';
import type { PlatformEntity } from '../../../../../data/entities/platform.ts';
import { SelectMultipleContent } from '../../../../../../components/Form/Select/Multi/SelectMultipleContent.tsx';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash-es';
export const PlatformChecklist = memo(function PlatformChecklist() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectFilterPlatforms);
  const options = useMemo(
    () => [
      { label: 'All', value: 'all' },
      ...platforms
        .map(platform => ({
          label: platform.name,
          value: platform.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [platforms]
  );

  const platformsIds = useAppSelector(selectFilterPlatformIds);
  const [activeIndex] = useState<number | null>(null);

  const handleChange = useCallback(
    (selected: PlatformEntity['id'][]) => {
      if (selected.includes('all')) {
        dispatch(filteredVaultsActions.setPlatformIds([]));
        return;
      }
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

  const allSelected = useMemo(() => isEmpty(platformsIds), [platformsIds]);
  const noneSelected = useMemo(() => platformsIds.length === 0, [platformsIds]);

  return (
    <SelectMultipleContent
      options={options}
      selected={platformsIds}
      activeIndex={activeIndex}
      allSelected={allSelected}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={setListRefs}
      searchEnabled={true}
      placeholder={t('Filter-Platforms-Search-Placeholder')}
    />
  );
});
