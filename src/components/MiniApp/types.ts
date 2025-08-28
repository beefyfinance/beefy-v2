import type { Context } from '@farcaster/miniapp-sdk';

export type MiniAppSdkContext = Context.MiniAppContext;

export type MiniAppContextPresent = {
  isInMiniApp: true;
  context: MiniAppSdkContext;
  ready: boolean;
};

export type MiniAppContextAbsent = {
  isInMiniApp: false;
  context: null;
  ready: false;
};

export type MiniAppContextData = MiniAppContextPresent | MiniAppContextAbsent;
