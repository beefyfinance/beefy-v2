import { createElement } from 'react';
const attrs = {"viewBox":"0 0 24 24","xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","focusable":"false","aria-hidden":"true"};
const inner = "<path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\" />";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });
}
