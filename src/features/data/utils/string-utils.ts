export function cammelCaseToText(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function djb2Hash(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}
