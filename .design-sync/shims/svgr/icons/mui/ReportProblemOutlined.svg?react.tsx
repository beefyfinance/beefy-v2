import { createElement } from 'react';
const attrs = {"viewBox":"0 0 24 24","xmlns":"http://www.w3.org/2000/svg","fill":"currentColor","focusable":"false","aria-hidden":"true"};
const inner = "<path d=\"M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z\" />";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });
}
