import type { BrowserRouterProps, HashRouterProps } from 'react-router';
import type { ElementType } from 'react';
type RouterProps = BrowserRouterProps & HashRouterProps;
export declare const routerMode: string;
export declare const Router: ElementType<RouterProps>;
export {};
