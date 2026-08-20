import { createElement } from 'react';
const attrs = {"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<rect x=\"1\" y=\"1\" width=\"18\" height=\"18\" rx=\"9\" stroke=\"#999CB3\" stroke-width=\"2\"/>\n<rect x=\"5\" y=\"5\" width=\"10\" height=\"10\" rx=\"5\" fill=\"#F5F5FF\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
