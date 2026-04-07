/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.riv' {
  const src: string;
  // eslint-disable-next-line no-restricted-syntax
  export default src;
}
