import BigNumber from 'bignumber.js';
import type { FetchAllBalanceFulfilledPayload } from '../actions/balance';
import { fetchAllBalanceAction } from '../actions/balance';
import { selectFilteredVaults } from '../selectors/filtered-vaults';
import { createIdMap } from '../utils/array-utils';
import { getBeefyTestingStore } from '../utils/test-utils';
import { filteredVaultsActions } from './filtered-vaults';
import { userDidConnect } from './wallet/wallet';
import { describe, expect, it } from 'vitest';

describe('Filter vaults tests', () => {
  it('should show gov vaults when showing eligible vaults and you have BIFI balance', async () => {
    const store = await getBeefyTestingStore();

    // we have a balance of BIFI
    const initBalancePayload: FetchAllBalanceFulfilledPayload = {
      chainId: 'avax',
      state: await store.getState(),
      walletAddress: '0x000',
      data: {
        boosts: [],
        govVaults: [
          {
            vaultId: 'avax-bifi-gov',
            rewards: new BigNumber(1),
            balance: new BigNumber(1),
          },
        ],
        tokens: [
          {
            tokenAddress: '0xCeefB07Ad37ff165A0b03DC7C808fD2E2fC77683', // avax-bifi-maxi
            amount: new BigNumber(1),
          },
        ],
      },
    };
    store.dispatch({ type: fetchAllBalanceAction.fulfilled, payload: initBalancePayload });

    // we are connected
    store.dispatch(userDidConnect({ chainId: 'avax', address: '0x000' }));

    // we filtered by eligible vaults
    store.dispatch(filteredVaultsActions.setChainIds(['avax']));
    store.dispatch(filteredVaultsActions.setUserCategory('deposited'));

    // we should show earning vault + maxi vault
    const vaultList = selectFilteredVaults(store.getState()).map(vaultId => ({ id: vaultId }));
    const vaultListById = createIdMap(vaultList, vault => vault.id);
    expect(vaultListById['avax-bifi-maxi']).toBeDefined();
    expect(vaultListById['avax-bifi-gov']).toBeDefined();
  });
});
