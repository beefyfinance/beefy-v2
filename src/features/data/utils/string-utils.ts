export function cammelCaseToText(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}
