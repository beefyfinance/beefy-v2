import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
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
      dispatch(filteredVaultsActions.setChainIds([]));
      break;
    case 'platform':
      dispatch(filteredVaultsActions.setPlatformIds([]));
      break;
    case 'category':
      dispatch(filteredVaultsActions.setVaultCategory([]));
      break;
    case 'type':
      dispatch(filteredVaultsActions.setAssetType([]));
      break;
    case 'product':
      dispatch(filteredVaultsActions.setStrategyType('all'));
      break;
    case 'flags':
      for (const filter of FLAG_KEYS) {
        dispatch(filteredVaultsActions.setBoolean({ filter, value: false }));
      }
      break;
    case 'mintvl':
      dispatch(
        filteredVaultsActions.setBigNumber({ filter: 'minimumUnderlyingTvl', value: BIG_ZERO })
      );
      break;
    case 'userCategory':
      dispatch(filteredVaultsActions.setUserCategory('all'));
      break;
  }
}

const ClearSearchButton = memo(function ClearSearchButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClear = useCallback(() => {
    dispatch(filteredVaultsActions.setSearchText(''));
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
    dispatch(filteredVaultsActions.setBoolean({ filter: 'onlyRetired', value: true }));
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

  return (
    <Message title="NoResults-NoResultsFound" text="NoResults-TryClearSearch">
      {suggestions.length > 0 && (
        <Chips>
          <ChipsLabel>{t('NoResults-DidYouMean')}</ChipsLabel>
          {suggestions.map(suggestion => (
            <Chip
              key={suggestion}
              type="button"
              onClick={() => dispatch(filteredVaultsActions.setSearchText(suggestion))}
            >
              {suggestion}
            </Chip>
          ))}
        </Chips>
      )}
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
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
});

const ChipsLabel = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const Chip = styled('button', {
  base: {
    textStyle: 'body.sm.medium',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '16px',
    background: 'background.content.light',
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
