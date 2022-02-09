import { configureStore, createAsyncThunk, createSlice, EnhancedStore } from '@reduxjs/toolkit';
import { createFulfilledActionCapturer } from './async-utils';

describe('Async utils tests', () => {
  // @ts-ignore
  let testStore: EnhancedStore<S, A, M> = null;

  beforeEach(() => {
    testStore = configureStore({
      reducer: testSlice.reducer,
    });
  });

  it('should delay dispatching a /fulfilled action', async () => {
    const captureFulfilledAction = createFulfilledActionCapturer(testStore);

    // dispatch an async action, should have both /pending and /fulfilled in the log
    await testStore.dispatch(testAction({ what: 'NOT catched async 1' }));

    // now start an async action but capture the fulfilled result
    // we should only see "/pending" in the log
    const fulfillPromise = captureFulfilledAction(testAction({ what: 'Captured Action' }));

    // dispatch a non catched async action, should have both /pending and /fulfilled in the log
    await testStore.dispatch(testAction({ what: 'NOT catched async 2' }));
    // dispatch a non related error
    await testStore.dispatch(testActionFail({ what: 'Exception' }));

    const fulfilledAction = (await fulfillPromise)();
    // just dispatch it for snapshot testing
    await testStore.dispatch(fulfilledAction);

    expect(testStore.getState()).toMatchSnapshot();
  });

  it('should replace action state payload with the latest state', async () => {
    const captureFulfilledAction = createFulfilledActionCapturer(testStore);

    const fulfillPromise = captureFulfilledAction(
      testAction({ what: 'Captured Action', state: {} })
    );

    const getter = await fulfillPromise;
    const action = getter() as unknown as { payload: { state: any } };
    expect(action.payload).toMatchSnapshot();
  });

  it('should throw if the captured action fails', async () => {
    const captureFulfilledAction = createFulfilledActionCapturer(testStore);

    // now start an async action but capture the fulfilled result
    // we should only see "/pending" in the log
    const fulfillPromise = captureFulfilledAction(testActionFail({ what: 'Captured Action' }));

    try {
      const res = await fulfillPromise;
      expect(res).toBeUndefined();
    } catch (e) {
      expect(e.error).toBeDefined();
      expect(e.error.message).toEqual(actionFailError.message);
    }
  });
});

const testAction = createAsyncThunk<any, any>('test', async params => params);
const actionFailError = new Error('Failed on purpose');
const testActionFail = createAsyncThunk<any, any>('test', async params => {
  throw actionFailError;
});
const testSlice = createSlice({
  initialState: { log: [] as Array<any> },
  name: 'test',
  reducers: {},
  extraReducers: builder => {
    builder.addCase(testAction.pending, (sliceState, action) => {
      sliceState.log.push({ type: action.type, args: action.meta.arg, payload: action.payload });
    });
    builder.addCase(testAction.rejected, (sliceState, action) => {
      sliceState.log.push({ type: action.type, args: action.meta.arg, payload: action.payload });
    });
    builder.addCase(testAction.fulfilled, (sliceState, action) => {
      sliceState.log.push({ type: action.type, args: action.meta.arg, payload: action.payload });
    });
  },
});
