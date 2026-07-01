import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { setupListeners } from '@reduxjs/toolkit/query';

// action functions are not exposed - extract their types
type CustomHandlerFn = NonNullable<Parameters<typeof setupListeners>[1]>;
type CustomHandlerActionCreators = Parameters<CustomHandlerFn>[1];
type CustomHandlerActions = {
  [K in keyof CustomHandlerActionCreators]: CustomHandlerActionCreators[K] extends (
    (noArgument: void) => PayloadAction<undefined, infer T>
  ) ?
    T
  : never;
};
const internalPrefix = '__rtkq/' as const;
const internalListenerActions = {
  onFocus: `${internalPrefix}focused`,
  onFocusLost: `${internalPrefix}unfocused`,
  onOnline: `${internalPrefix}online`,
  onOffline: `${internalPrefix}offline`,
} as const satisfies CustomHandlerActions;

function isOnline() {
  return (
    typeof navigator === 'undefined' ? true
    : navigator.onLine === undefined ? true
    : navigator.onLine
  );
}

function isDocumentVisible(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }
  return document.visibilityState !== 'hidden';
}

export type WindowState = {
  /** Whether the browser tab is currently focused and visible */
  focused: boolean;
  /** Whether browser has network connectivity */
  online: boolean;
};

const initialState: WindowState = {
  focused: isDocumentVisible(),
  online: isOnline(),
};

export const windowSlice = createSlice({
  name: 'window',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(internalListenerActions.onFocus, state => {
        state.focused = true;
      })
      .addCase(internalListenerActions.onFocusLost, state => {
        state.focused = false;
      })
      .addCase(internalListenerActions.onOnline, state => {
        state.online = true;
      })
      .addCase(internalListenerActions.onOffline, state => {
        state.online = false;
      });
  },
});

export const windowReducer = windowSlice.reducer;
