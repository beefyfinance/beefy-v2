# To decide

- Have a unique reducer for apy/apr/tvl/staked amount? -> "boost on chain data" and "vault on chain data"
- Review wording
- Review file structure, every file has the same name, it's driving me nuts
- Is there any reason why the config data (chain, vaults, etc) should be in the redux state? Why not have just a local global variable storing those?
- Is this really necessary to test that rejected and pending do nothing on all reducers?
- Do we query contract data of active vaults/boosts first? Maybe user staked in there. But how many users really

# TODO:

[x] Define TS types Draft for business entities

    [x] Basic types based on configuration files
    [x] Analyse current redux state and complete types
    [x] Re-read all chebiN detailed explaination to make sure nothing is missing

[x] Compile a list of each type of vault/boost to create a regression testing book
[ ] Extract API code

    [x] Config (chains, vaults, boosts)
    [x] Vault contract data
    [x] Boost contract data
    [ ] Balances
    [ ] Allowances

[ ] Create new reducers using new TS types

    [x] Config (chains, vaults, boosts)
    [x] TVL? (need some unit tests to make sure I didn't fuck it up)
    [ ] APY
    [ ] Balances
    [ ] Allowances

[ ] Rework components to use new reducers
[ ] Rework search to handle partially loaded data
[ ] Create unit tests for critical business cases
[ ] Rework error handling
[ ] Ensure percieved performance is OK
[ ] State persistence on reload
[ ] Code reviews & fixes
[ ] Regression Testing & fixes

    [ ] Make sure TVL is properly computed (compare with current bêta)

BONUS:

[ ] Currently, when the wallet is connected, Memory usage goes steadily up, It’d be ideal if we could prevent memory leaks from existing once this is over

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
- Other Critical features
  - Wallet Connection
  - Wallet boost/vault balance
  - Wallet portfolio
  - Platform tvl/buyback
  - Allowances
  - Deposit
  - Withdraw
  - Zap
  - BIFI token price

# WEIRD STUFF / QUESTIONS

- Why not use https://api.beefy.finance/vaults and https://api.beefy.finance/boosts?
- why is there an api.beefy.finance and a data.beefy.finance?
- Is the balance reducer really used? seems like it's empty
- Gov Vaults are erc20 tokens?
- What would be the most effective way to fetch balances?
- What is a reward?
- Allowances are fetched aggressively, is this necessary? Can't we just fetch allowances when looking at a vault?
- Only some of the gov vaults have excluded links, is this normal?

# ANSWERED

- why is there a token.isGovVault in the balance.tsx action?
  When fetching the balance for the govVault, since it resembles a boost and doesn't, we must also fetch the rewards for it
  So as to know how much pending rewards we have to be claimed
  this isn't a pretty design by any means and can be rethought
- what is the gov vault pool address?
  can be removed, same as contractAddress
- what are allowances used for?
  ui uses it to tell user if he needs to allow more token
- What is boost.tokenDecimals in vault.tsx?
  it's the vault token
- Boost.isMooStaked: is this always "true"?
  this is the boolean that tells us if the thing is a boost or a vault when both are in the same list, got it
