import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash-es';

/** Fast local updates with debounced commit (e.g. dispatch to redux) */
export function useDebouncedState<T>(
  external: T,
  commit: (value: T) => void,
  { wait, isEqual = Object.is }: { wait: number; isEqual?: (a: T, b: T) => boolean }
): [T, (value: T) => void] {
  const [draft, setDraft] = useState(external);

  // Adopt external changes during render (React "adjust state on prop change").
  const [lastExternal, setLastExternal] = useState(external);
  if (!isEqual(external, lastExternal)) {
    setLastExternal(external);
    if (!isEqual(external, draft)) {
      setDraft(external);
    }
  }

  // Stable identity across renders, but always invokes the latest closure.
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });
  const debouncedCommit = useMemo(
    () => debounce((value: T) => commitRef.current(value), wait),
    [wait]
  );
  useEffect(() => () => debouncedCommit.flush(), [debouncedCommit]);

  const setValue = useCallback(
    (value: T) => {
      setDraft(value);
      debouncedCommit(value);
    },
    [debouncedCommit]
  );

  return [draft, setValue];
}
