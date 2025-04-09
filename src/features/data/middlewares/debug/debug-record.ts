import BigNumber from 'bignumber.js';
import { isObject } from 'lodash-es';
import type { Action, AnyAction, Dispatch } from 'redux';
import type { ChainEntity } from '../../entities/chain.ts';
import { mapValuesDeep } from '../../utils/array-utils.ts';
import { featureFlag_recordReduxActions } from '../../utils/feature-flags.ts';

declare const window: {
  __export_action_log?: typeof exportActionLog;
} & Window &
  typeof globalThis;

const actionLog: Action[] = [];

function exportActionLog(pretty: boolean = true) {
  if (!featureFlag_recordReduxActions()) {
    return;
  }
  console.warn(`
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠ DO NOT SHARE WITH UNTRUSTED PEOPLE ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠

    Exporting log file....
    This file may contain your wallet address, asset balance and allowance.
    
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠ DO NOT SHARE WITH UNTRUSTED PEOPLE ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠
    ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠`);
  const now = new Date().toISOString();
  const filename = `redux_debug-${now}.json`;
  downloadObjectAsJsonFile(actionLog, filename, pretty);
}

if (window && featureFlag_recordReduxActions()) {
  window.__export_action_log = exportActionLog;
}

export function debugRecorderMiddleware() {
  if (featureFlag_recordReduxActions()) {
    console.info('Recording redux actions, use `__export_action_log()` to export the result');
  }
  return (next: Dispatch) =>
    (action: {
      type: string;
      payload: {
        chainId?: ChainEntity['id'];
      };
    }) => {
      if (featureFlag_recordReduxActions()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let smallAction: any = action;
        // empty some actions to make the export less heavy
        if (
          action.type.startsWith('vaults/fetchAllVaults/') ||
          action.type.startsWith('boosts/fetchAllBoosts/') ||
          action.type.startsWith('chains/fetchChainConfigs/')
        ) {
          smallAction = { ...smallAction, payload: '__PAYLOAD__' };
        }

        // remove previous state from action payload
        if (
          smallAction.payload &&
          isObject(smallAction.payload) &&
          'state' in smallAction.payload
        ) {
          smallAction = { ...smallAction, payload: { ...smallAction.payload, state: '__STATE__' } };
        }

        // map non-serializable objects
        const serializableAction = mapValuesDeep(smallAction, val => {
          if (val instanceof BigNumber) {
            return '__BIG_NUM__' + val.toString(10);
          } else if (val instanceof Date) {
            return '__DATE__' + val.toUTCString();
          } else {
            return val;
          }
        }) as AnyAction;
        actionLog.push(serializableAction);
      }
      return next(action);
    };
}

// https://stackoverflow.com/a/45831280/2523414
function downloadObjectAsJsonFile(
  obj: object,
  filename: string = 'download.json',
  pretty: boolean = true
) {
  const str = pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  const blob = new Blob([str], { type: 'application/json' });

  const e = document.createEvent('MouseEvents');
  const a = document.createElement('a');
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
  // @ts-ignore
  e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}
