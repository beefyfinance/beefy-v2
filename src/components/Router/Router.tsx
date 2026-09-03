import type { BrowserRouterProps, HashRouterProps } from 'react-router';
import { BrowserRouter, HashRouter } from 'react-router';
import type { ElementType } from 'react';
import { routerMode } from './router-mode.ts';

type RouterProps = BrowserRouterProps & HashRouterProps;

export const Router: ElementType<RouterProps> =
  routerMode === 'browser' ? BrowserRouter : HashRouter;
