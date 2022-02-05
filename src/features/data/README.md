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

[x] Code review n°1 changes

    [x] remove duplicate boost contractAddress and earnContractAddress
    [x] Store ppfs in the vault reducer, this is a vault property
    [x] remove comments "like maybe we want to re-render more often, we could make this a generator instead" or explain
    [x] we can remove poolAddress from govVaults and use earnContractAddress instead it's the same in the end
    [x] periodFinish could be parsed as an int, it's a timestamp. we use it to know if there's an active one, we know that if current timestamp is less than that
    [x] merge token and token-price reducers
    [x] have a list of deprecated tokens (tokens not listed in the api) for development so we can have a clear exception when requesting an unknown token id. In prod, just set price to 0 to avoid breaking the app
    [x] double check that undefined isn't returned while fetching rewardRate and periodFinish
    [x] fix the allowance api to add regular tokens (cf. answers section)
    [x] break dependencies between actions to fetch everything asap.
        For home we need TVL, APY, user deposited amount both in usd and token amount, for gov vaults => rewards

[x] Extract API code

    [x] Config (chains, vaults, boosts)
    [x] Vault contract data
    [x] Boost contract data
    [x] Balances
    [x] Allowances
    [x] Wallet

[x] Create new reducers using new TS types

    [x] Config (chains, vaults, boosts)
    [x] TVL? (need some unit tests to make sure I didn't fuck it up)
    [x] APY
    [x] Balances
    [x] Allowances
    [x] Wallet

[x] Fetch scenario for the home page

    [x] prices
    [x] Config (chains, vaults, boosts)
    [x] Chain data (vaults, boosts)
    [x] Balances
    [x] Allowances
    [x] Wallet

[ ] Smarter data loading

    [x] handle errors
    [x] handle loading
    [ ] handle canceling ongoing requests

[ ] Code cleanup & Testing

    [x] remove unused price mocks
    [ ] reorganize files?
    [x] remove unnecessary comments
    [x] ensure TVL and APY is computed properly
    [x] ensure user balance is computed properly
    [ ] ensure user allowances are computed properly
    [ ] make tests run in CI

[ ] Rework components to use new reducers

    [ ] Go over left todos
    [ ] Filters: search box, vault category, user vault category, moonpot
    [ ] Make sure we can still use the vault page
    [ ] Prevent wallet popin on startup
    [ ] Bifi price missing
    [ ] fix vault TVL (maybe exclusions)
    [ ] Store last used filters
    [ ] Do some performance enhancement (scenario + filters)
    [ ] Remove unused old code

[ ] Rework search to handle partially loaded data
[ ] Create unit tests for critical business cases
[ ] Rework error handling
[ ] Ensure percieved performance is OK
[ ] State persistence on reload
[ ] Code reviews & fixes
[ ] Regression Testing & fixes

    [ ] Make sure TVL is properly computed (compare with current bêta)

[ ] Apply decimals as soon as possible (in the API classes). We won't loose precision as we return bignumbers only
[ ] Use BigNumber.shiftedBy when relevant for perf improvements

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

- scream-ftm and 0xdao-wftm-eol have an oracleId set to "WFTM" but no "tokenAddress" set. I have hardcoded that W+<native> implies native but I'm sure there is something fishy.
- Why wait to apply decimals if we use big numbers everywhere? Ex: token has 18 decimals, api fetch balance and returns the raw api value. Should the api return a big number with decimal applied to simplify the rest of the app?
- Is there a good test address? someone who deposited in every single vault and boost on all chains
- can we run unit tests in CI?
- On fantom boost moo_boo_ftm-tomb, the "earnedOracleId" is "BIFI", but the "earnedTokenAddress" is "0xbF07093ccd6adFC3dEB259C557b61E94c1F66945" where on fantom, BIFI token address is "0xd6070ae98b8069de6b494332d1a1a81b6179d960". The "earnedTokenAddress" points to the mooFantomBIFI token. Is this normal? what's going on?
- What is "zero" in "sortConfig" => sortConfig.deposited === false && sortConfig.zero === false
- What is `launchpoolApr.apr;`

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
- Why not use https://api.beefy.finance/vaults and https://api.beefy.finance/boosts?
  The design decision to only use blockchain endpoints was lost along the way.
  Maybe one day we'll allow user to chose between using only the beefy api for fast access or only use the blockchain for effective decentralization.
  A mix between the 2 approaches is a bug, but not fixing it right now.
- why is there an api.beefy.finance and a data.beefy.finance?
  data.beefy.finance is used to query certain historical data. Api returns live results
- What is a reward?
  vaults autocompound. so you stake 1 BIFI-BNB, the following day you'll have a bit more of that (1.005 maybe)
  so vaults just grow your deposit. boosts however give you reward on a different token.
  So a boost could be stake mooBifiBnb, earn ETH.
  rewards refer to the amount of the reward token that you have
- Gov Vaults are erc20 tokens?
  No, not at all. gov vaults are boosts at a contract lvl, so not tokens.
  the tokens you stake (bifi) are erc20
- What would be the most effective way to fetch balances? what minimal data would be needed to display the home page?
  so we need, TVL, APY, user deposited amount both in usd and token amount, for gov vaults => rewards
- Allowances are fetched aggressively, is this necessary? Can't we just fetch allowances when looking at a vault?
  the current UI doesn't allow for depositing/withdrawing from the home page... which i hate @Pablo @Dieter
  So it could, in theory be done your way
- Only some of the gov vaults have excluded links, is this normal?
  no that's not right. if there isn't a maxi vault yet (such as on FUSE) we shouldn't have it
  11/12 should have it
- Is this normal behavior that rewardRate and periodFinish returns undefined? or am I querying the wrong address?
  that shouldn't be the case
- What is the expected behavior when price is not returned by /lp api or /prices. Ex: pool blizzard-blzd-bnb-eol has oracleId of blizzard-blzd-bnb, which is not present in the api. Current behavior: I think it's because they rug, so token price is 0 by default, but we log a console warning.
  i think we are setting it to 0, not sure if that's ideal it's just how it is being done
- What is boost.earnContractAddress
  This is the boost's contract address
- What is queried here? (balance.tsx). Where do we get the initial list of spenders?

  ```
    for (let spender in token.allowance) {
      calls[net].push({
        allowance: tokenContract.methods.allowance(address, spender),
  ```

  balance checks how much a user has of each token
  and how much each vault contract that uses it is allowed to spend
  vaults are tokens, right? (mooTokens)
  so to know how much a user has in a vault, it checks the balance for that token
  this is for normal vaults/tokens, for gov vault balances it's different as usual
  ok so the token.allowance list is initiated with the list of vaults that have this token as oracleId
