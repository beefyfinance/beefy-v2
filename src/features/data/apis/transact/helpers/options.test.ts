import { describe, expect, it } from 'vitest';
import { dropSingleIdentityOption } from './options.ts';

const usdc = { address: '0xUSDC' };
const eth = { address: '0xETH' };

describe('dropSingleIdentityOption', () => {
  it('drops the identity option but keeps swap routes and other strategies', () => {
    const options = [
      { id: 'identity', strategyId: 'single', inputs: [usdc], wantedOutputs: [usdc] },
      { id: 'swap', strategyId: 'single', inputs: [eth], wantedOutputs: [usdc] },
      { id: 'other', strategyId: 'curve', inputs: [usdc], wantedOutputs: [usdc] },
    ];

    expect(dropSingleIdentityOption(options, '0xusdc').map(o => o.id)).toEqual(['swap', 'other']);
  });
});
