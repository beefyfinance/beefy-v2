import { createElement } from 'react';
const attrs = {"width":"12","height":"12","viewBox":"0 0 12 12","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<rect x=\"12\" y=\"5.25\" width=\"1.5\" height=\"12\" rx=\"0.75\" transform=\"rotate(90 12 5.25)\" fill=\"#dadce8\"/>\n<rect x=\"5.25\" width=\"1.5\" height=\"12\" rx=\"0.75\" fill=\"#dadce8\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
