import { createContext } from 'react';
import type { MiniAppContextData } from './types.ts';

export const MiniAppContext = createContext<MiniAppContextData>({
  isInMiniApp: false,
  context: null,
  ready: false,
});
