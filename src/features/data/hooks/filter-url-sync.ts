import { useEffect, useRef, useState } from 'react';
import { NavigationType, useLocation, useNavigate, useNavigationType } from 'react-router';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import type { FilteredVaultsPreset } from '../reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import {
  selectFilterOptions,
  selectFilterUrlSearch,
  selectFilterUrlSearchOmitPlatform,
} from '../selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { canonicalizeSearch, parseFilterSearch, serializeFilters } from '../utils/filter-url.ts';

const WRITE_DEBOUNCE_MS = 250;

/**
 * Single owner of the filter state <-> url search sync.
 * Both directions are fixed-point comparisons in canonical space, so a
 * self-caused event is a no-op and feedback loops cannot occur.
 * - url wins on mount and on back/forward when it carries filter params or a path preset
 * - state wins otherwise: filters are reflected into the url via debounced replaces
 *
 * `pathPreset` must be referentially stable (memoized by the caller).
 */
export function useFilterUrlSync(pathPreset?: FilteredVaultsPreset): boolean {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const filters = useAppSelector(selectFilterOptions);
  const stateSearch = useAppSelector(
    pathPreset ? selectFilterUrlSearchOmitPlatform : selectFilterUrlSearch
  );
  const [synced, setSynced] = useState(false);
  const reconciledRef = useRef(false);
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const filtersRef = useRef(filters);
  const stateSearchRef = useRef(stateSearch);

  useEffect(() => {
    filtersRef.current = filters;
    stateSearchRef.current = stateSearch;
  });

  // url -> state: on mount and on back/forward; own replaces are skipped
  useEffect(() => {
    if (reconciledRef.current && navigationType !== NavigationType.Pop) {
      return;
    }
    reconciledRef.current = true;

    if (writeTimerRef.current) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = undefined;
    }

    const { preset, recognized, carry } = parseFilterSearch(location.search);
    if (recognized || pathPreset) {
      // url wins: reset all filters to the url's, keeping wallet-specific ones
      const desired: FilteredVaultsPreset = {
        ...preset,
        ...pathPreset,
        userCategory: filtersRef.current.userCategory,
        onlyUnstakedClm: filtersRef.current.onlyUnstakedClm,
      };
      if (serializeFilters(desired, { omitPlatform: !!pathPreset }) !== stateSearchRef.current) {
        dispatch(filteredVaultsActions.reset(desired));
        void dispatch(recalculateFilteredVaultsAction({ filtersChanged: true })).then(() => {
          setSynced(true);
        });
      } else {
        setSynced(true);
      }
    } else {
      // state wins: reflect current filters into the bare url
      const target = serializeFilters(filtersRef.current, { carry });
      if (target !== canonicalizeSearch(location.search)) {
        navigate({ pathname: location.pathname, search: target }, { replace: true });
      }
      setSynced(true);
    }
  }, [dispatch, navigate, navigationType, location.pathname, location.search, pathPreset]);

  // state -> url: debounced replace once the initial reconcile is done
  useEffect(() => {
    if (!synced) {
      return;
    }
    const { carry } = parseFilterSearch(location.search);
    const target = serializeFilters(filters, { omitPlatform: !!pathPreset, carry });
    if (target === canonicalizeSearch(location.search)) {
      return;
    }
    writeTimerRef.current = setTimeout(() => {
      writeTimerRef.current = undefined;
      navigate({ pathname: location.pathname, search: target }, { replace: true });
    }, WRITE_DEBOUNCE_MS);
    return () => {
      if (writeTimerRef.current) {
        clearTimeout(writeTimerRef.current);
        writeTimerRef.current = undefined;
      }
    };
  }, [synced, filters, navigate, location.pathname, location.search, pathPreset]);

  return synced;
}
