# TODO:

[ ] Define TS types for business entities

    [x] Basic types based on configuration files
    [x] Analyse current redux state and complete types
    [x] Re-read all chebiN detailed explaination to make sure nothing is missing

[ ] Compile a list of each type of vault/boost to create a regression testing book
[ ] Extract API code

    [ ] Create api classes and input types, create output types when needed
    [ ] Wrap in methods and actions

[ ] Create new reducers using new TS types
[ ] Rework components to use new reducers
[ ] Rework search to handle partially loaded data
[ ] Create unit tests for critical business cases
[ ] Rework error handling
[ ] Ensure percieved performance is OK
[ ] State persistence on reload
[ ] Code reviews & fixes
[ ] Regression Testing & fixes

# PERSONAL NOTES

These types were generated based on the config files
Just a quick note for later

```typescript
/**
 * GENERATEO TYPES
 */

// generated from pools static data with https://jvilk.com/MakeTypes/
export interface Pools {
  id: string;
  logo?: string | null;
  name: string;
  pricePerFullShare: number;
  tvl: number;
  oraclePrice?: number | null; // pulled afterward
  oracle: 'tokens' | 'lp';
  oracleId: TokenSingle['id'] | TokenLP['id'];
  status: 'active' | 'eol';
  platform: Platform['id'];
  assets?: TokenSingle['id'][];
  risks?: string[] | null;
  stratType: string;
  withdrawalFee?: string | null;
  network: string;
  poolAddress?: string | null;
  excluded?: string | null;
  isGovVault?: boolean | null;
  callFee?: number | null;
  createdAt?: number | null;
  addLiquidityUrl?: string | null;
  retireReason?: string | null;
  removeLiquidityUrl?: string | null;
  depositFee?: string | null;
  refund?: boolean | null;
  refundContractAddress?: string | null;
  depositsPaused?: boolean | null;
  showWarning?: boolean | null;
  warning?: string | null;
}

export interface Boosts {
  id: string;
  poolId: string;
  name: string;
  assets?: string[] | null;
  earnedToken: string;
  earnedTokenDecimals: number;
  earnedTokenAddress: string;
  earnContractAddress: string;
  earnedOracle: string;
  earnedOracleId: string;
  partnership: boolean;
  status: string;
  isMooStaked: boolean;
  partners?: PartnersEntity[] | null;
  logo?: string | null;
  fixedStatus?: boolean | null;
}
```
