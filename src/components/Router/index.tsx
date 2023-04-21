import { BrowserRouter, HashRouter } from 'react-router-dom';
import type { BrowserRouterProps, HashRouterProps } from 'react-router-dom';
import type { ElementType } from 'react';

type RouterProps = BrowserRouterProps & HashRouterProps;

export const routerMode = import.meta.env.VITE_ROUTER === 'browser' ? 'browser' : 'hash';
export const Router: ElementType<RouterProps> =
  routerMode === 'browser' ? BrowserRouter : HashRouter;
