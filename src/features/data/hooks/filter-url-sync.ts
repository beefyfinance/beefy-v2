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
function getLiveUrl(): string {
  if (routerMode === 'hash') {
    return window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/';
  }
  return window.location.pathname + window.location.search;
}

/**
 * Single owner of the filter state <-> url search sync.
 * Both directions are fixed-point comparisons in canonical space, so a
 * self-caused event is a no-op and feedback loops cannot occur.
 * - url wins on mount and on back/forward when it carries filter params
 * - state wins otherwise: filters are reflected into the url via debounced replaces
 */
export function useFilterUrlSync(): void {
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
    if (recognized) {
      // url wins: reset all filters to the url's, keeping wallet-specific ones
      const desired: FilteredVaultsPreset = {
        ...preset,
        userCategory: syncRef.current.userCategory,
        onlyUnstakedClm: syncRef.current.onlyUnstakedClm,
      };
      if (serializeFilters(desired) !== syncRef.current.stateSearch) {
        dispatch(filteredVaultsActions.reset(desired));
        // the middleware recalcs again after its debounce; dispatching directly resolves synced sooner
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
  }, [dispatch, navigate, navigationType, location.pathname, location.search]);

  // state -> url: debounced replace once the initial reconcile is done
  useEffect(() => {
    if (!synced) {
      return;
    }
    const { carry } = parseFilterSearch(location.search);
    const target = canonicalizeSearch(stateSearch, { carry });
    if (target === canonicalizeSearch(location.search)) {
      return;
    }
    const pathname = location.pathname;
    const search = location.search;
    writeTimerRef.current = setTimeout(() => {
      writeTimerRef.current = undefined;
      // a navigation/pop may not have committed yet; don't clobber it
      if (getLiveUrl() !== pathname + search) {
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
  }, [synced, stateSearch, navigate, location.pathname, location.search]);
}
