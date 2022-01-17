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
