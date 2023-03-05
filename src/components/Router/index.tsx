import { BrowserRouter, BrowserRouterProps, HashRouter, HashRouterProps } from 'react-router-dom';
import { ElementType } from 'react';

type RouterProps = BrowserRouterProps & HashRouterProps;

export const routerMode = import.meta.env.VITE_ROUTER === 'browser' ? 'browser' : 'hash';
export const Router: ElementType<RouterProps> =
  routerMode === 'browser' ? BrowserRouter : HashRouter;
