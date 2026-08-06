import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getLiveLocation } from '../../../components/Router/live-location.ts';
import { filteredVaultsActions } from '../reducers/filtered-vaults.ts';
import { selectFilterUrlSearch } from '../selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { canonicalizeSearch, decideFilterUrlSync } from '../utils/filter-url.ts';

/** filter state <-> url sync; tracks pending */
export function useFilterUrlSync(): void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const stateSearch = useAppSelector(selectFilterUrlSearch);
  const lastSeenUrlRef = useRef<string | undefined>(undefined);
  if (lastSeenUrlRef.current === undefined) {
    lastSeenUrlRef.current = canonicalizeSearch(location.search);
  }

  useEffect(() => {
    // react-router's location can lag the real browser url mid-transition,
    // acting on a stale location.search would mis-sync filters / overwrite lastSeenUrl
    const live = getLiveLocation();
    if (
      live.pathname !== location.pathname ||
      canonicalizeSearch(live.search) !== canonicalizeSearch(location.search)
    ) {
      return;
    }

    const { seenUrl, apply, write } = decideFilterUrlSync(
      location.search,
      lastSeenUrlRef.current,
      stateSearch
    );
    lastSeenUrlRef.current = seenUrl;

    if (apply) {
      dispatch(filteredVaultsActions.setFromUrl(apply));
      return;
    }

    if (write !== undefined) {
      try {
        navigate({ pathname: location.pathname, search: write }, { replace: true });
        lastSeenUrlRef.current = write;
      } catch (e) {
        // safari throttles replaceState
        console.error(`Failed to update filter url`, e);
      }
    }
  }, [dispatch, navigate, stateSearch, location.pathname, location.search]);
}
