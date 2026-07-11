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
    // via href, as firefox returns location.hash percent-decoded
    const href = window.location.href;
    const hashIndex = href.indexOf('#');
    return hashIndex >= 0 && href.startsWith('#/', hashIndex) ? href.slice(hashIndex + 1) : '/';
  }
  return window.location.pathname + window.location.search;
}

/**
 * Single owner of the filter state <-> url search sync: the url wins on mount and
 * back/forward, otherwise state is reflected into the url via debounced replaces.
 * Both directions compare in canonical space, so self-caused events are no-ops.
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
      // (this also rewrites popped bare entries: bare is indistinguishable from never-set)
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
