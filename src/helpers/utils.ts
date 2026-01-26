export function isEmpty(value: unknown) {
  if (value === undefined || value === '' || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    value = value.trim();
    return value === '' || value === 'null' || value === 'undefined';
  } else if (typeof value === 'undefined') {
    return true;
  } else if (typeof value === 'object') {
    for (const _ in value) {
      return false;
    }
    return true;
  } else if (typeof value === 'boolean') {
    return false;
  }

  return false;
}
