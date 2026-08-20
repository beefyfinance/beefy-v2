import type { BeefyState } from '../../store/types';
import type { ChainEntity } from '../../entities/chain';
export declare const selectIsAddressBookLoadedGlobal: import("../data-loader-helpers").GlobalDataSelectorFn<boolean>;
export declare const selectShouldInitAddressBook: (state: BeefyState, chainId: ChainEntity["id"]) => boolean;
export declare const selectIsAddressBookLoaded: (state: BeefyState, chainId: ChainEntity["id"]) => boolean;
