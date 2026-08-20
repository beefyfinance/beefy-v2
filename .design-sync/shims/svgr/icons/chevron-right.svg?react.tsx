import { createElement } from 'react';
const attrs = {"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.021 15.311L13.1252 10.0006L8.021 4.69011L6.93954 5.72956L11.0446 10.0006L6.93954 14.2716L8.021 15.311Z\" fill=\"currentColor\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
