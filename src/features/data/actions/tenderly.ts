import type { EIP1193Provider } from '@web3-onboard/core';
import type { TFunction } from 'react-i18next';
import { ZERO_ADDRESS } from '../../../helpers/addresses.ts';
import { getWalletConnectionApi } from '../apis/instances.ts';
import { TenderlyApi } from '../apis/tenderly/tenderly-api.ts';
import type { TenderlySimulateRequest, TenderlySimulateResponse } from '../apis/tenderly/types.ts';
import type { TransactOption, TransactQuote } from '../apis/transact/transact-types.ts';
import type { ChainId } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { Step } from '../reducers/wallet/stepper-types.ts';
import { selectChainById } from '../selectors/chains.ts';
import {
  selectTenderlyCredentialsOrUndefined,
  selectTenderlyRequestOrUndefined,
} from '../selectors/tenderly.ts';
import type { BeefyDispatchFn } from '../store/types.ts';
import { sleep, withTimeoutSignal } from '../utils/async-utils.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { claimMerkl, claimStellaSwap } from './wallet/offchain.ts';
import { getTransactSteps } from './wallet/transact.ts';

export type TenderlyTxCallRequest = {
  data: string;
  from: string;
  to: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  value?: string;
  step: string;
};

export type TenderlyCredentials = {
  account: string;
  project: string;
  secret: string;
};

export type TenderlyOpenSimulationPayload = {
  chainId: ChainId;
  calls: TenderlyTxCallRequest[];
};

type MockReceipt = {
  blockHash: string;
  blockNumber: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: number;
  from: string;
  gasUsed: number;
  logs: unknown[];
  logsBloom: string;
  status: number;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: number;
};

export async function captureTransactionsFromSteps(steps: Step[], dispatch: BeefyDispatchFn) {
  const api = await getWalletConnectionApi();
  const mockReceipts = new Map<string, MockReceipt>();
  const inProgress = new Set<string>();
  const mockTxReceipt = {
    blockHash: '0x0001',
    blockNumber: 1,
    cumulativeGasUsed: 0,
    effectiveGasPrice: 0,
    // from: '',
    gasUsed: 0,
    logs: [],
    logsBloom: '0x0000',
    status: 1,
    // to: '',
    // transactionHash: '',
    transactionIndex: 0,
    type: 0,
  };
  const calls: TenderlyTxCallRequest[] = [];
  let nextMockTxHash = BigInt('0x0101010101010101010101010101010101010101010101010101010100000000');

  const wrapper = (provider: EIP1193Provider): EIP1193Provider => {
    return new Proxy(provider, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(target: EIP1193Provider, p: string | symbol, receiver: unknown): any {
        const base = Reflect.get(target, p, receiver);
        if (typeof base === 'function') {
          if (p === 'request') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return async function (args: any) {
              if (args && args.method && args.params) {
                const { method, params } = args;

                if (method === 'eth_sendTransaction') {
                  console.log('[captured/mocked]', args);
                  const [data] = params;
                  calls.push(data);

                  const mockTxHash = `0x${(++nextMockTxHash).toString(16)}`;
                  mockReceipts.set(mockTxHash, {
                    ...mockTxReceipt,
                    transactionHash: mockTxHash,
                    from: data.from || ZERO_ADDRESS,
                    to: data.to || ZERO_ADDRESS,
                  });
                  inProgress.add(mockTxHash);

                  const result = [mockTxHash];
                  console.log('[>>]', result);
                  return result;
                } else if (method === 'eth_getTransactionReceipt') {
                  const [txHash] = params[0];

                  const result = mockReceipts.get(txHash);
                  if (result) {
                    console.log('[mocked]', args);
                    inProgress.delete(txHash);
                    console.log('[>>]', result);
                    return result;
                  }
                }
              }

              console.log('[passthrough]', args);
              return base(args) as never;
            };
          }
        }
        return base;
      },
    });
  };

  const result = await withTimeoutSignal(10000, (signal: AbortSignal) =>
    api.withProviderWrapper(wrapper, async () => {
      for (const step of steps) {
        const callsCompleted = calls.length;
        await dispatch(step.action);
        while (calls.length <= callsCompleted) {
          signal.throwIfAborted();
          await sleep(100);
        }
      }

      return calls.map((call, i) => ({
        ...call,
        step: steps[i].step,
      }));
    })
  );

  if (result.length !== steps.length) {
    throw new Error(`Did not capture all transactions`);
  }

  return result;
}

type TenderlySaveConfigParams = {
  credentials: TenderlyCredentials;
};
type TenderlySaveConfigPayload = {
  credentials: TenderlyCredentials;
};

export const tenderlyLogin = createAppAsyncThunk<
  TenderlySaveConfigPayload,
  TenderlySaveConfigParams
>('tenderly/saveConfig', async ({ credentials }) => {
  const api = new TenderlyApi(credentials);

  // we are just fetching an endpoint to test the access token etc

  await api.fetchSimulations({
    perPage: 1,
    page: 1,
  });

  return { credentials };
});

type TenderlySimulateTransactQuoteParams = {
  option: TransactOption;
  quote: TransactQuote;
  t: TFunction;
};

export const tenderlySimulateTransactQuote = createAppAsyncThunk<
  TenderlyOpenSimulationPayload,
  TenderlySimulateTransactQuoteParams
>('tenderly/simulateTransactQuote', async ({ option, quote, t }, { getState, dispatch }) => {
  const steps = await getTransactSteps(quote, t, getState);
  const txs = await captureTransactionsFromSteps(steps, dispatch);
  return { chainId: option.chainId, calls: txs };
});

type TenderlyStellaSwapClaimButtonParams = {
  chainId: ChainId;
  vaultId: VaultEntity['id'];
  t: TFunction;
};

export const tenderlySimulateStellaSwapClaim = createAppAsyncThunk<
  TenderlyOpenSimulationPayload,
  TenderlyStellaSwapClaimButtonParams
>('tenderly/simulateStellaSwapClaim', async ({ chainId, vaultId, t }, { dispatch }) => {
  const steps: Step[] = [
    {
      step: 'claim-rewards',
      message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
      action: claimStellaSwap(chainId, vaultId),
      pending: false,
    },
  ];
  const txs = await captureTransactionsFromSteps(steps, dispatch);
  return { chainId: chainId, calls: txs };
});

type TenderlyMerklClaimButtonParams = {
  chainId: ChainId;
  t: TFunction;
};

export const tenderlySimulateMerklClaim = createAppAsyncThunk<
  TenderlyOpenSimulationPayload,
  TenderlyMerklClaimButtonParams
>('tenderly/simulateMerklClaim', async ({ chainId, t }, { dispatch }) => {
  const steps: Step[] = [
    {
      step: 'claim-rewards',
      message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
      action: claimMerkl(chainId),
      pending: false,
    },
  ];
  const txs = await captureTransactionsFromSteps(steps, dispatch);
  return { chainId: chainId, calls: txs };
});

export type TenderlySimulateConfig = {
  type: 'full' | 'quick' | 'abi';
  save: 'always' | 'if-fails' | 'never';
};

export type TenderlySimulateParams = {
  config: TenderlySimulateConfig;
};

export type TenderlySimulatePayload = {
  chainId: ChainId;
  calls: TenderlyTxCallRequest[];
  config: TenderlySimulateConfig;
  requests: TenderlySimulateRequest[];
  responses: Array<TenderlySimulateResponse>;
};

export const tenderlySimulate = createAppAsyncThunk<
  TenderlySimulatePayload,
  TenderlySimulateParams
>('tenderly/simulate', async ({ config }, { getState }) => {
  const state = getState();
  const creds = selectTenderlyCredentialsOrUndefined(state);
  if (!creds) {
    throw new Error('Tenderly credentials not set');
  }
  const request = selectTenderlyRequestOrUndefined(state);
  if (!request || !request.calls || !request.calls.length) {
    throw new Error('No calls to simulate');
  }

  const api = new TenderlyApi(creds);
  const requests = request.calls.map((call): TenderlySimulateRequest => {
    const chain = selectChainById(state, request.chainId);
    return {
      network_id: chain.networkChainId.toString(),
      from: call.from,
      to: call.to,
      input: call.data,
      gas: 8000000,
      value: call.value || '0',
      save: config.save === 'always',
      save_if_fails: config.save === 'if-fails',
      simulation_type: config.type,
    };
  });
  const responses =
    requests.length > 1 ? await api.simulateBundle(requests) : [await api.simulate(requests[0])];

  return {
    config,
    chainId: request.chainId,
    calls: request.calls,
    requests,
    responses,
  };
});
