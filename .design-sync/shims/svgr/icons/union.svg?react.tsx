import { createElement } from 'react';
const attrs = {"width":"14","height":"14","viewBox":"0 0 14 14","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<path d=\"M6.2998 11.2H7.6998L7.6998 7.69999L11.1998 7.69999V6.29999H7.6998V2.79999L6.2998 2.79999L6.2998 6.29999H2.7998L2.7998 7.69999H6.2998L6.2998 11.2Z\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
