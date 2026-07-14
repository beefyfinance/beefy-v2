import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import type { FilteredVaultsPreset } from '../../../../../data/reducers/filtered-vaults-types.ts';
import {
  type BlockerCategory,
  FLAG_KEYS,
  selectSearchNoResultsInfo,
} from '../../../../../data/selectors/no-results.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { BeefyDispatchFn } from '../../../../../data/store/types.ts';
import { Message } from './Message.tsx';

function dispatchClearCategory(dispatch: BeefyDispatchFn, category: BlockerCategory) {
  switch (category) {
    case 'chain':
      dispatch(filteredVaultsActions.update({ chainIds: [] }));
      break;
    case 'platform':
      dispatch(filteredVaultsActions.update({ platformIds: [] }));
      break;
    case 'category':
      dispatch(filteredVaultsActions.update({ vaultCategory: [] }));
      break;
    case 'type':
      dispatch(filteredVaultsActions.update({ assetType: [] }));
      break;
    case 'product':
      dispatch(filteredVaultsActions.update({ strategyType: 'all' }));
      break;
    case 'flags': {
      const cleared: FilteredVaultsPreset = {};
      for (const filter of FLAG_KEYS) {
        cleared[filter] = false;
      }
      dispatch(filteredVaultsActions.update(cleared));
      break;
    }
    case 'mintvl':
      dispatch(filteredVaultsActions.update({ minimumUnderlyingTvl: BIG_ZERO }));
      break;
    case 'userCategory':
      // userCategory changes reset onlyUnstakedClm, matching the filter control
      dispatch(filteredVaultsActions.update({ userCategory: 'all', onlyUnstakedClm: false }));
      break;
  }
}

const ClearSearchButton = memo(function ClearSearchButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClear = useCallback(() => {
    dispatch(filteredVaultsActions.update({ searchText: '' }));
  }, [dispatch]);
  return <Button onClick={handleClear}>{t('NoResults-ClearSearch')}</Button>;
});

const BlockedBy = memo(function BlockedBy({
  blockers,
  showCount,
}: {
  blockers: BlockerCategory[];
  showCount: number;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleShowAll = useCallback(() => {
    for (const category of blockers) {
      dispatchClearCategory(dispatch, category);
    }
  }, [dispatch, blockers]);

  // no chips: the active filters are already shown in the toolbar directly above
  return (
    <Message
      title="NoResults-NoResultsFound"
      text="NoResults-SearchBlockedBy"
      textParams={{ count: showCount }}
    >
      <Actions>
        <Button variant="cta" onClick={handleShowAll}>
          {t('NoResults-ShowMatches', { count: showCount })}
        </Button>
        <ClearSearchButton />
      </Actions>
    </Message>
  );
});

const RetiredMatches = memo(function RetiredMatches({ count }: { count: number }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleShowRetired = useCallback(() => {
    dispatch(filteredVaultsActions.update({ onlyRetired: true }));
  }, [dispatch]);

  return (
    <Message
      title="NoResults-NoResultsFound"
      text="NoResults-RetiredMatches"
      textParams={{ count }}
    >
      <Actions>
        <Button variant="cta" onClick={handleShowRetired}>
          {t('NoResults-ShowRetired')}
        </Button>
        <ClearSearchButton />
      </Actions>
    </Message>
  );
});

const Suggestions = memo(function Suggestions({ suggestions }: { suggestions: string[] }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hasSuggestions = suggestions.length > 0;

  return (
    <Message
      title="NoResults-NoResultsFound"
      text={hasSuggestions ? undefined : 'NoResults-TryDifferent'}
      body={
        hasSuggestions ?
          <Chips>
            <ChipsLabel>{t('NoResults-DidYouMean')}</ChipsLabel>
            {suggestions.map(suggestion => (
              <Chip
                key={suggestion}
                type="button"
                onClick={() => dispatch(filteredVaultsActions.update({ searchText: suggestion }))}
              >
                {suggestion}
              </Chip>
            ))}
          </Chips>
        : undefined
      }
    >
      <Actions>
        <ClearSearchButton />
      </Actions>
    </Message>
  );
});

export const SearchNoResults = memo(function SearchNoResults() {
  const info = useAppSelector(selectSearchNoResultsInfo);

  switch (info.kind) {
    case 'address-too-short':
      // a partial address is not a failed lookup: neutral title + hint
      return (
        <Message title="NoResults-NoResultsFound" text="NoResults-Search-Address-TooShort">
          <ClearSearchButton />
        </Message>
      );
    case 'address-no-match':
      return (
        <Message title="NoResults-Search-Address-NoMatch" text="NoResults-Search-Address-Hint">
          <ClearSearchButton />
        </Message>
      );
    case 'blocked':
      return <BlockedBy blockers={info.blockers} showCount={info.showCount} />;
    case 'retired':
      return <RetiredMatches count={info.count} />;
    case 'suggestions':
      return <Suggestions suggestions={info.suggestions} />;
  }
});

const Chips = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline', // label aligns with the text-only cards' second line
    gap: '8px',
  },
});

const ChipsLabel = styled('span', {
  base: {
    textStyle: 'body',
    color: 'text.middle',
  },
});

const Chip = styled('button', {
  base: {
    textStyle: 'body.sm.medium',
    padding: '4px 12px',
    borderRadius: '4px',
    background: 'bayOfMany',
    color: 'text.middle',
    cursor: 'pointer',
    _hover: {
      color: 'text.light',
    },
  },
});

const Actions = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
});
