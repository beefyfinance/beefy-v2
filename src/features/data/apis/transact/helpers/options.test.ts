import { describe, expect, it } from 'vitest';
import { dropSingleIdentityOption } from './options.ts';

const usdc = { address: '0xUSDC' };
const eth = { address: '0xETH' };

describe('dropSingleIdentityOption', () => {
  it('drops the plain identity option but keeps its boosted counterpart and swap routes', () => {
    const options = [
      { id: 'identity', strategyId: 'single', inputs: [usdc], wantedOutputs: [usdc] },
      { id: 'boosted', strategyId: 'single', inputs: [usdc], wantedOutputs: [usdc], boostId: 'b' },
      { id: 'swap', strategyId: 'single', inputs: [eth], wantedOutputs: [usdc] },
      { id: 'other', strategyId: 'curve', inputs: [usdc], wantedOutputs: [usdc] },
    ];

    expect(dropSingleIdentityOption(options, '0xusdc').map(o => o.id)).toEqual([
      'boosted',
      'swap',
      'other',
    ]);
  });
});
