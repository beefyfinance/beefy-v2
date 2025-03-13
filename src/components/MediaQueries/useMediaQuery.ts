import { useLayoutEffect, useState } from 'react';
import { createCachedFactory } from '../../features/data/utils/factory-utils.ts';

function useMediaQueryServer(_query: string, defaultValue: boolean = false) {
  return defaultValue;
}

export const getMatchMedia = createCachedFactory(
  (query: string) => window.matchMedia(query),
  (query: string) => query
);

function useMediaQueryClient(query: string, _defaultValue: boolean = false) {
  const [value, setValue] = useState<boolean>(() => getMatchMedia(query).matches);

  useLayoutEffect(() => {
    const matchMedia = getMatchMedia(query);

    const handleChange = (e: MediaQueryListEvent) => setValue(e.matches);
    matchMedia.addEventListener('change', handleChange);

    return () => matchMedia.removeEventListener('change', handleChange);
  }, [query]);

  return value;
}

export const useMediaQuery =
  typeof window === 'undefined' ? useMediaQueryServer : useMediaQueryClient;
