import { styled } from '@repo/styles/jsx';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectFilteredVaultCount } from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export type SearchResultCountProps = {
  /** query is non-empty; the announcer stays mounted regardless so live regions persist */
  hasQuery: boolean;
  /** the filtered list reflects the typed query */
  settled: boolean;
  focused: boolean;
};

export const SearchResultCount = memo(function SearchResultCount({
  hasQuery,
  settled,
  focused,
}: SearchResultCountProps) {
  const { t } = useTranslation();
  const count = useAppSelector(selectFilteredVaultCount);
  // remember the last settled count so typing dims the previous number instead of flashing
  const [held, setHeld] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (settled && hasQuery) {
      setHeld(count);
    } else if (!hasQuery) {
      // a cleared box starts a new session: the old count must not flash under the next query
      setHeld(undefined);
    }
  }, [settled, hasQuery, count]);

  // settled renders the live count directly: no stale frame while the effect catches up
  const shown =
    !hasQuery ? undefined
    : settled ? count
    : held;

  return (
    <>
      {shown !== undefined && (
        <Count dimmed={!settled}>{t('Search-ResultCount', { count: shown })}</Count>
      )}
      <Announcer role="status" aria-live="polite" aria-atomic={true}>
        {hasQuery && focused && settled ? t('Search-CountAnnounce', { count }) : ''}
      </Announcer>
    </>
  );
});

const Count = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    // reserved width so the clear button doesn't shift as the count appears/changes
    minWidth: '5em',
    textAlign: 'right',
  },
  variants: {
    dimmed: {
      true: {
        opacity: '0.4',
      },
    },
  },
});

const Announcer = styled('span', {
  base: {
    srOnly: true,
  },
});
