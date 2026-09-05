import BigNumber from 'bignumber.js';
import { pad, parseEventLogs, toEventSelector, toHex } from 'viem';
import type * as Viem from 'viem';
import type { Hex, Log, TransactionReceipt } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectBoostClaimed, selectMintResult, selectZapReturned } from './stepper.ts';

vi.mock('viem', async importOriginal => {
  const actual = await importOriginal<typeof Viem>();
  return { ...actual, parseEventLogs: vi.fn(actual.parseEventLogs) };
});

const parseEventLogsMock = vi.mocked(parseEventLogs);

const CHAIN = 'base';
// checksummed forms, so a lookup that forgets to lowercase cannot pass by accident
const USER = '0x111111111111111111111111111111111111000B';
const BOOST_CONTRACT = '0x222222222222222222222222222222222222000D';
const REWARD_TOKEN = '0x333333333333333333333333333333333333000B';
const MINT_CONTRACT = '0x444444444444444444444444444444444444000A';
const MINT_TOKEN = '0x555555555555555555555555555555555555000A';
const ZAP_CONTRACT = '0x666666666666666666666666666666666666000D';
const DUST_TOKEN = '0x777777777777777777777777777777777777000A';
const NATIVE_ADDRESS = '0x888888888888888888888888888888888888000A';

const TRANSFER_TOPIC = toEventSelector('Transfer(address,address,uint256)');
const TOKEN_RETURNED_TOPIC = toEventSelector('TokenReturned(address,uint256)');

let nextLogIndex = 0;

function baseLog(address: string, topics: Hex[], data: Hex): Log {
  return {
    // an rpc returns log.address lowercased; viem's formatters never checksum it
    address: address.toLowerCase() as Hex,
    topics,
    data,
    blockHash: pad('0x1', { size: 32 }),
    blockNumber: 1n,
    logIndex: nextLogIndex++,
    transactionHash: pad('0x2', { size: 32 }),
    transactionIndex: 0,
    removed: false,
  } as unknown as Log;
}

function transferLog(token: string, from: string, to: string, value: bigint): Log {
  return baseLog(
    token,
    [TRANSFER_TOPIC, pad(from as Hex, { size: 32 }), pad(to as Hex, { size: 32 })],
    pad(toHex(value), { size: 32 })
  );
}

function tokenReturnedLog(emitter: string, token: string, amount: bigint): Log {
  return baseLog(
    emitter,
    [TOKEN_RETURNED_TOPIC, pad(token as Hex, { size: 32 })],
    pad(toHex(amount), { size: 32 })
  );
}

function makeReceipt(logs: Log[]): TransactionReceipt {
  return {
    from: USER,
    to: MINT_CONTRACT,
    contractAddress: ZAP_CONTRACT,
    status: 'success',
    logs,
  } as unknown as TransactionReceipt;
}

function erc20(address: string, symbol: string) {
  return { type: 'erc20', id: symbol, symbol, chainId: CHAIN, address, decimals: 18 };
}

function makeState(walletActions: unknown): BeefyState {
  return {
    entities: {
      tokens: {
        byChainId: {
          [CHAIN]: {
            native: 'ETH',
            byId: { ETH: NATIVE_ADDRESS.toLowerCase() },
            byAddress: {
              [NATIVE_ADDRESS.toLowerCase()]: {
                type: 'native',
                id: 'ETH',
                symbol: 'ETH',
                chainId: CHAIN,
                address: NATIVE_ADDRESS,
                decimals: 18,
              },
              [REWARD_TOKEN.toLowerCase()]: erc20(REWARD_TOKEN, 'RWD'),
              [MINT_TOKEN.toLowerCase()]: erc20(MINT_TOKEN, 'MOO'),
              [DUST_TOKEN.toLowerCase()]: erc20(DUST_TOKEN, 'DUST'),
            },
          },
        },
      },
      vaults: {
        byId: {
          'test-vault': {
            id: 'test-vault',
            chainId: CHAIN,
            type: 'standard',
            contractAddress: MINT_CONTRACT,
            depositTokenAddress: MINT_TOKEN,
          },
        },
      },
      promos: {
        byId: {
          'test-boost': {
            id: 'test-boost',
            type: 'boost',
            chainId: CHAIN,
            contractAddress: BOOST_CONTRACT,
          },
        },
      },
    },
    user: { walletActions },
  } as unknown as BeefyState;
}

function dispatch(state: BeefyState): BeefyState {
  return { ...state, entities: { ...state.entities } } as BeefyState;
}

function mintState(logs: Log[]) {
  return makeState({
    result: 'success',
    data: { hash: '0xabc', receipt: makeReceipt(logs) },
    additional: { amount: new BigNumber(3), token: erc20(MINT_TOKEN, 'MOO') },
  });
}

function boostState(logs: Log[]) {
  return makeState({
    result: 'success',
    data: { hash: '0xabc', receipt: makeReceipt(logs) },
    additional: {
      type: 'boost',
      amount: new BigNumber(1),
      token: erc20(REWARD_TOKEN, 'RWD'),
      boostId: 'test-boost',
      walletAddress: USER,
    },
  });
}

function zapState(logs: Log[]) {
  return makeState({
    result: 'success',
    data: { hash: '0xabc', receipt: makeReceipt(logs) },
    additional: {
      type: 'zap',
      amount: new BigNumber(1),
      token: erc20(MINT_TOKEN, 'MOO'),
      vaultId: 'test-vault',
      expectedTokens: [erc20(MINT_TOKEN, 'MOO')],
    },
  });
}

// a fresh logs array per test: the parse memo is keyed on its identity and lives for the module
const buyLogs = () => [transferLog(MINT_TOKEN, MINT_CONTRACT, USER, 7n * 10n ** 18n)];
const claimLogs = () => [transferLog(REWARD_TOKEN, BOOST_CONTRACT, USER, 2n * 10n ** 18n)];
const dustLogs = () => [tokenReturnedLog(ZAP_CONTRACT, DUST_TOKEN, 5n * 10n ** 17n)];

beforeEach(() => {
  parseEventLogsMock.mockClear();
});

describe('stepper success selectors', () => {
  describe('selectMintResult', () => {
    it('reads the receipt logs', () => {
      expect(selectMintResult(mintState(buyLogs()))).toEqual({
        type: 'buy',
        amount: '7',
        token: expect.objectContaining({ address: MINT_TOKEN }),
      });
    });

    it('parses the logs once however many dispatches land while the modal is open', () => {
      let state = mintState(buyLogs());
      const first = selectMintResult(state);
      for (let i = 0; i < 5; i++) {
        state = dispatch(state);
        expect(selectMintResult(state)).toEqual(first);
      }
      expect(parseEventLogsMock).toHaveBeenCalledTimes(1);
    });

    it('returns a stable reference across dispatches, so the modal does not re-render', () => {
      const state = mintState(buyLogs());
      expect(selectMintResult(dispatch(state))).toBe(selectMintResult(state));
    });

    it('re-parses when the receipt changes', () => {
      selectMintResult(mintState(buyLogs()));
      const other = selectMintResult(mintState([]));
      expect(parseEventLogsMock).toHaveBeenCalledTimes(2);
      expect(other.type).toBe('mint');
      expect(other.amount).toBe('3');
    });

    it('still throws on a wallet action that is not a success', () => {
      const idle = makeState({ result: undefined, data: undefined, additional: undefined });
      expect(() => selectMintResult(idle)).toThrow('Not wallet action success');
      // a memoized throw would be served as a value on the second read
      expect(() => selectMintResult(idle)).toThrow('Not wallet action success');
    });
  });

  describe('selectBoostClaimed', () => {
    it('reads the receipt logs', () => {
      const claimed = selectBoostClaimed(boostState(claimLogs()));
      expect(claimed).toHaveLength(1);
      expect(claimed[0].token.symbol).toBe('RWD');
      expect(claimed[0].amount.toString(10)).toBe('2');
    });

    it('parses the logs once however many dispatches land while the modal is open', () => {
      let state = boostState(claimLogs());
      const first = selectBoostClaimed(state);
      for (let i = 0; i < 5; i++) {
        state = dispatch(state);
        expect(selectBoostClaimed(state)).toEqual(first);
      }
      expect(parseEventLogsMock).toHaveBeenCalledTimes(1);
    });

    it('re-parses when the receipt changes', () => {
      selectBoostClaimed(boostState(claimLogs()));
      expect(selectBoostClaimed(boostState([]))).toHaveLength(0);
      expect(parseEventLogsMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('selectZapReturned', () => {
    it('reads the receipt logs', () => {
      const returned = selectZapReturned(zapState(dustLogs()));
      expect(returned).toHaveLength(1);
      expect(returned[0].token.symbol).toBe('DUST');
      expect(returned[0].amount.toString(10)).toBe('0.5');
    });

    it('parses the logs once however many dispatches land while the modal is open', () => {
      let state = zapState(dustLogs());
      const first = selectZapReturned(state);
      for (let i = 0; i < 5; i++) {
        state = dispatch(state);
        expect(selectZapReturned(state)).toEqual(first);
      }
      expect(parseEventLogsMock).toHaveBeenCalledTimes(1);
    });

    it('re-parses when the receipt changes', () => {
      selectZapReturned(zapState(dustLogs()));
      expect(selectZapReturned(zapState([]))).toHaveLength(0);
      expect(parseEventLogsMock).toHaveBeenCalledTimes(2);
    });
  });

  it('shares one parse between the three selectors reading the same receipt', () => {
    const logs = [...buyLogs(), ...claimLogs()];
    const receiptLogs = logs;
    selectMintResult(mintState(receiptLogs));
    selectBoostClaimed(boostState(receiptLogs));
    // two ABIs over one logs array: Transfer is parsed once, TokenReturned once
    selectZapReturned(zapState(receiptLogs));
    expect(parseEventLogsMock).toHaveBeenCalledTimes(2);
  });
});
