import { createElement } from 'react';
const attrs = {"width":"28","height":"28","viewBox":"0 0 28 28","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<rect x=\"1.39993\" y=\"5.59998\" width=\"25.2\" height=\"2.8\" fill=\"currentColor\"/>\n<rect x=\"1.39993\" y=\"12.6\" width=\"25.2\" height=\"2.8\" fill=\"currentColor\"/>\n<rect x=\"1.39993\" y=\"19.5999\" width=\"25.2\" height=\"2.8\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
