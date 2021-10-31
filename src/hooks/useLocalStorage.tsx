import { useEffect, useState } from 'react';

/**
 *
 * @param key Local storage key
 * @param initialValue Default value
 * @param isValid (Optional) Function that validates the stored value on load
 */
function useLocalStorage(key, initialValue, isValid) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const storedRaw = window.localStorage.getItem(key);
      const storedObject = storedRaw ? JSON.parse(storedRaw) : initialValue;

      return typeof isValid !== 'function' || isValid(storedObject) ? storedObject : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
