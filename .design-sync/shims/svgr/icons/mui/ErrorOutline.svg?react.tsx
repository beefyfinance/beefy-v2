import { createElement } from 'react';
const attrs = {"viewBox":"0 0 24 24","xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","focusable":"false","aria-hidden":"true"};
const inner = "<path d=\"M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\" />";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });
}
