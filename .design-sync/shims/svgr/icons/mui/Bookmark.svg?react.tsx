import { createElement } from 'react';
const attrs = {"viewBox":"0 0 24 24","xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","focusable":"false","aria-hidden":"true"};
const inner = "<path d=\"M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z\" />";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });
}
