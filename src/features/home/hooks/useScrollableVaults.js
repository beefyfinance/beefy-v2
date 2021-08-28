const { useState, useCallback, useMemo } = require('react');
const CHUNK_SIZE = 20;

function useScrollableVaults(vaults) {
  const [hasMore, setHasMore] = useState(vaults.length > CHUNK_SIZE);
  const [numberLoaded, setNumberLoaded] = useState(CHUNK_SIZE);

  const loadMore = useCallback(() => {
    if (numberLoaded < vaults.length) {
      setNumberLoaded(numberLoaded + CHUNK_SIZE);
      setHasMore(numberLoaded + CHUNK_SIZE < vaults.length);
    } else {
      setHasMore(false);
    }
  }, [vaults, numberLoaded]);

  const loaded = useMemo(() => vaults.slice(0, numberLoaded), [vaults, numberLoaded]);

  return [loaded, numberLoaded, hasMore, loadMore];
}

export default useScrollableVaults;
