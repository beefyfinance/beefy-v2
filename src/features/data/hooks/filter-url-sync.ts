import { useEffect, useRef, useState } from 'react';
import { NavigationType, useLocation, useNavigate, useNavigationType } from 'react-router';
import { routerMode } from '../../../components/Router/router-mode.ts';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import type { FilteredVaultsPreset } from '../reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import {
  selectFilterOnlyUnstakedClm,
  selectFilterUrlSearch,
  selectFilterUserCategory,
} from '../selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { canonicalizeSearch, parseFilterSearch, serializeFilters } from '../utils/filter-url.ts';

const WRITE_DEBOUNCE_MS = 250;

/** the router's location can lag behind (startTransition/lazy chunks); read the real url */
function getLivePathname(): string {
  if (routerMode === 'hash') {
    const hashPath = window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/';
    const queryIndex = hashPath.indexOf('?');
    return queryIndex === -1 ? hashPath : hashPath.slice(0, queryIndex);
  }
  return window.location.pathname;
}

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
  const stateSearch = useAppSelector(selectFilterUrlSearch);
  const userCategory = useAppSelector(selectFilterUserCategory);
  const onlyUnstakedClm = useAppSelector(selectFilterOnlyUnstakedClm);
  const [synced, setSynced] = useState(false);
  const reconciledRef = useRef(false);
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const syncRef = useRef({ stateSearch, userCategory, onlyUnstakedClm });

  // latest values for the effects below; must stay declared first (effects run in declaration order)
  useEffect(() => {
    syncRef.current = { stateSearch, userCategory, onlyUnstakedClm };
  });

  // url -> state: on mount and on back/forward; own replaces are skipped
  useEffect(() => {
    if (reconciledRef.current && navigationType !== NavigationType.Pop) {
      return;
    }
    reconciledRef.current = true;

    // on back/forward the url takes priority over any pending outbound write
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
        userCategory: syncRef.current.userCategory,
        onlyUnstakedClm: syncRef.current.onlyUnstakedClm,
      };
      // compare in full space so path preset mismatches stay visible
      if (serializeFilters(desired) !== syncRef.current.stateSearch) {
        dispatch(filteredVaultsActions.reset(desired));
        void dispatch(recalculateFilteredVaultsAction({ filtersChanged: true })).then(() => {
          setSynced(true);
        });
      } else {
        setSynced(true);
      }
    } else {
      // state wins: reflect current filters into the bare url
      const target = canonicalizeSearch(syncRef.current.stateSearch, { carry });
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
    const target = canonicalizeSearch(stateSearch, { omitPlatform: !!pathPreset, carry });
    if (target === canonicalizeSearch(location.search)) {
      return;
    }
    const pathname = location.pathname;
    writeTimerRef.current = setTimeout(() => {
      writeTimerRef.current = undefined;
      // a navigation to a lazy route may not have committed yet; don't clobber it
      if (getLivePathname() !== pathname) {
        return;
      }
      navigate({ pathname, search: target }, { replace: true });
    }, WRITE_DEBOUNCE_MS);
    return () => {
      if (writeTimerRef.current) {
        clearTimeout(writeTimerRef.current);
        writeTimerRef.current = undefined;
      }
    };
  }, [synced, stateSearch, navigate, location.pathname, location.search, pathPreset]);

  return synced;
}
