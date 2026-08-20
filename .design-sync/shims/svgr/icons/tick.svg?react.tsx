import { createElement } from 'react';
const attrs = {"xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","viewBox":"0 0 20 20"};
const inner = "\n    <path fill-rule=\"evenodd\" d=\"m15.737 4.938-6.754 6.609L6.23 8.938l-1.235 1.305 4.01 3.797 7.99-7.818z\" clip-rule=\"evenodd\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
