import BigNumber from 'bignumber.js';
import { fetchAllBalanceAction, FetchAllBalanceFulfilledPayload } from '../actions/balance';
import { selectFilteredVaults } from '../selectors/filtered-vaults';
import { createIdMap } from '../utils/array-utils';
import { getBeefyTestingStore } from '../utils/test-utils';
import { filteredVaultsActions } from './filtered-vaults';
import { userDidConnect } from './wallet/wallet';

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
        govVaults: [],
        tokens: [
          {
            tokenId: 'BIFI',
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
    store.dispatch(filteredVaultsActions.setUserCategory('eligible'));

    // we should show earning vault + maxi vault
    const vaultList = selectFilteredVaults(store.getState());
    const vaultListById = createIdMap(vaultList, vault => vault.id);
    expect(vaultListById['avax-bifi-maxi']).toBeDefined();
    expect(vaultListById['avax-bifi-gov']).toBeDefined();
  });
});
