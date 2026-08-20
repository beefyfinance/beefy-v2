import { createElement } from 'react';
const attrs = {"width":"12","height":"12","viewBox":"0 0 12 12","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<rect x=\"2.4\" y=\"2.4\" width=\"7.2\" height=\"7.2\" rx=\"1\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
