import { createElement } from 'react';
const attrs = {"viewBox":"0 0 24 24","xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","focusable":"false","aria-hidden":"true"};
const inner = "<path d=\"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z\" />";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });
}
