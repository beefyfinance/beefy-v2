import BigNumber from 'bignumber.js';
import { isString } from 'lodash-es';
import { fetchChainConfigs } from '../../actions/chains.ts';
import { fetchAllVaults } from '../../actions/vaults.ts';
import { mapValuesDeep } from '../../utils/array-utils.ts';
import { sleep } from '../../utils/async-utils.ts';
import { featureFlag_replayReduxActions } from '../../utils/feature-flags.ts';
import { store } from '../../store/store.ts';
import type { AnyAction } from '@reduxjs/toolkit';

declare const window: {
  __replay_action_log?: typeof replayReduxActions;
} & Window &
  typeof globalThis;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function replayReduxActions(actionsList: any[], delayMs: 200) {
  for (const action of actionsList) {
    // replay removed actions from log
    if (action.type.startsWith('vaults/fetchAllVaults/')) {
      await store.dispatch(fetchAllVaults());
    } /*else if (action.type.startsWith('boosts/fetchAllBoosts/')) {
      await store.dispatch(fetchAllBoosts());
    } */ else if (action.type.startsWith('chains/fetchChainConfigs/')) {
      await store.dispatch(fetchChainConfigs());
    } else {
      if (action.payload && 'state' in action.payload && action.payload.state === '__STATE__') {
        action.payload.state = store.getState();
      }
      // recreate object instances
      const unserializedAction = mapValuesDeep(action, val => {
        if (!isString(val)) {
          return val;
        }
        if (val.startsWith('__BIG_NUM__')) {
          return new BigNumber(val.replace('__BIG_NUM__', ''));
        } else if (val.startsWith('__DATE__')) {
          return new Date(val.replace('__DATE__', ''));
        }
        return val;
      }) as AnyAction;
      store.dispatch(unserializedAction);
    }
    await sleep(delayMs);
  }
}

if (window && featureFlag_replayReduxActions()) {
  window.__replay_action_log = replayReduxActions;
}
