export function cammelCaseToText(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function keyIsToken(key: string) {
  if (key === 'others') return false;
  if (key === 'stables') return false;
  return true;
}
