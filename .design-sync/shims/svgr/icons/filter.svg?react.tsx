import { createElement } from 'react';
const attrs = {"width":"16","height":"17","viewBox":"0 0 16 17","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8 9.1069C8.02594 9.0775 8.05285 9.04883 8.08074 9.02094L14.1176 2.98403V1.88138H1.88235V2.98403L7.91926 9.02094C7.94715 9.04883 7.97407 9.0775 8 9.1069ZM0 3.76373V-0.000976562H16V3.76373L9.41177 10.352V16.4696L6.58824 14.5873V10.352L0 3.76373Z\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
