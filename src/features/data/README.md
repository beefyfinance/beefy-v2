# TODO:

[x] Define TS types Draft for business entities

    [x] Basic types based on configuration files
    [x] Analyse current redux state and complete types
    [x] Re-read all chebiN detailed explaination to make sure nothing is missing

[x] Compile a list of each type of vault/boost to create a regression testing book
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

# REGRESSION TESTING BOOK

- Test contexts

  - Any Desktop res (mouse)
  - Any Tablet res (touch) both portrait & landscape
  - White theme / Dark Theme

- Test vault list:
  - Full list should scroll smoothly
  - Test list controls
    - Test all filters
    - Test all sorts
    - Use the text search
  - Display of different kind of vaults:
    - Boosted vaults apy display and orange border
    - Gov vaults are larger, purple background, have custom text ("earn BNB"), no safety score
    - LP vaults have multiple token icons
    - Retired vaults, dark background, red border
    - Featured vaults, nothing special to display, just shown on the "featured" tab
  - Reloading should keep filters
- Test vault page
  - A gov vault: https://beta.beefy.finance/#/bsc/vault/bifi-gov
  - A maxi vault: https://beta.beefy.finance/#/heco/vault/heco-bifi-maxi
  - A multi asset vault: https://beta.beefy.finance/#/fantom/vault/beets-sound-of-moosic
  - An inactive vault: https://beta.beefy.finance/#/polygon/vault/curve-poly-atricrypto
  - Another inactive vault: https://beta.beefy.finance/#/polygon/vault/quick-bifi-eth-eol
  - A boosted vault: https://beta.beefy.finance/#/bsc/vault/cakev2-cake-bnb
  - The cake vault: https://beta.beefy.finance/#/bsc/vault/cake-cakev2
  - A featured vault: https://beta.beefy.finance/#/fantom/vault/scream-wbtc
  - A single asset vault: https://beta.beefy.finance/#/polygon/vault/aave-eth

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
