import { createElement } from 'react';
const attrs = {"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"9\" stroke=\"#999CB3\" stroke-width=\"2\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
