import { createElement } from 'react';
const attrs = {"width":"9","height":"7","viewBox":"0 0 9 7","fill":"none","xmlns":"http://www.w3.org/2000/svg"};
const inner = "\n<path d=\"M8.46845 0.739154L2.75845 6.3262L0 3.71385L0.710948 2.96313L2.64345 4.79293L2.74688 4.89057L2.84885 4.79148L7.74521 0L8.46845 0.739154Z\" fill=\"#95E2A8\"/>\n";
export default function Svg({ className, ...props }: Record<string, any>) {
  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });
}
