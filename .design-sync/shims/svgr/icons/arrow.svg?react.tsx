import { createElement } from 'react';
const attrs = {"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4.57417 5.32017L7.9949 8.60801L11.4156 5.32017L12.4412 6.38721L7.9949 10.6608L3.54858 6.38721L4.57417 5.32017Z\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
