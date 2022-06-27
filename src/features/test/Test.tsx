import React, { memo, useCallback, useEffect, useState } from 'react';
import { Container } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '../../store';
import { isInitialLoader } from '../data/reducers/data-loader';
import { fetchAllPricesAction } from '../data/actions/prices';
import { fetchAllAddressBookAction } from '../data/actions/tokens';
import { selectLpBreakdownByOracleId, selectTokenPriceByAddress } from '../data/selectors/tokens';
import { CowLoader } from '../../components/CowLoader';
import { BigNumber } from 'bignumber.js';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';

type TestBreakdownProps = {
  oracleId: string;
};
const TestBreakdown = memo<TestBreakdownProps>(function ({ oracleId }) {
  const breakdown = useAppSelector(state => selectLpBreakdownByOracleId(state, oracleId));
  const breakdownTokens = breakdown.tokens || [];
  const vault = useAppSelector(
    state => state.entities.vaults.byId[oracleId] || state.entities.vaults.byId[`${oracleId}-eol`]
  );
  const tokens = useAppSelector(state =>
    breakdownTokens.map(address =>
      vault ? state.entities.tokens.byChainId[vault.chainId].byAddress[address.toLowerCase()] : null
    )
  );
  const prices = useAppSelector(state =>
    tokens.map(token =>
      token ? state.entities.tokens.prices.byOracleId[token.oracleId] : 'unknown'
    )
  );
  const lpPrice = useAppSelector(state =>
    vault ? selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress) : 'unknown'
  );

  if (vault) {
    breakdownTokens.forEach((address, i) => {
      const haveToken = tokens[i] && 'symbol' in tokens[i];
      const havePrice = BigNumber.isBigNumber(prices[i]);
      if (!haveToken || !havePrice) {
        // if (haveToken) {
        //   // token but no price
        //   console.log(
        //     JSON.stringify({
        //       vaultId: vault.id,
        //       status: vault.status,
        //       chainId: vault.chainId,
        //       tokenAddress: address,
        //       tokenMissing: false,
        //       priceMissing: true,
        //       oracleId: tokens[i].oracleId,
        //     })
        //   );
        // } else {
        //   // no token
        //   console.log(
        //     JSON.stringify({
        //       vaultId: vault.id,
        //       status: vault.status,
        //       chainId: vault.chainId,
        //       tokenAddress: address,
        //       tokenMissing: true,
        //       priceMissing: 'unknown',
        //       oracleId: 'unknown',
        //     })
        //   );
        // }
      } else {
        console.log(vault.id);
      }
    });
  }

  return (
    <div className="test">
      <h3>
        {oracleId} -{' '}
        {vault ? (
          `${vault.name} (${vault.status}) - ${vault.chainId}`
        ) : (
          <span className="test-error">no vault found</span>
        )}
      </h3>
      {vault ? (
        <>
          <div>
            <div>lp address: {vault.depositTokenAddress}</div>
            <div>
              lp price:{' '}
              {lpPrice ? lpPrice.toString() : <span className="test-error">no price found</span>}
            </div>
          </div>
          <table width="100%">
            <thead>
              <tr>
                <th>breakdown addr</th>
                <th>token symbol</th>
                <th>token oracleId</th>
                <th>token price</th>
              </tr>
            </thead>
            <tbody>
              {breakdownTokens.map((address, i) => (
                <tr key={address}>
                  <td>{address}</td>
                  {tokens[i] ? (
                    <>
                      <td>{tokens[i].symbol}</td>
                      <td>{tokens[i].oracleId}</td>
                      <td>
                        {prices[i] ? (
                          prices[i].toString()
                        ) : (
                          <span className="test-error">no price found</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="test-error">
                      no token found
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
});

export const Test = memo(function Test() {
  const dispatch = useAppDispatch();
  const isAddressBookLoaded = useAppSelector(
    state => state.ui.dataLoader.global.addressBook.alreadyLoadedOnce
  );
  const shouldInitAddressBook = useAppSelector(state =>
    isInitialLoader(state.ui.dataLoader.global.addressBook)
  );
  const isPricesLoaded = useAppSelector(
    state => state.ui.dataLoader.global.prices.alreadyLoadedOnce
  );
  const shouldInitPrices = useAppSelector(state =>
    isInitialLoader(state.ui.dataLoader.global.prices)
  );
  const breakdownIds = useAppSelector(state =>
    Object.keys(state.entities.tokens.breakdown.byOracleId)
  );

  useEffect(() => {
    if (!isPricesLoaded && shouldInitPrices) {
      dispatch(fetchAllPricesAction());
    }
  }, [dispatch, isPricesLoaded, shouldInitPrices]);

  useEffect(() => {
    if (!isAddressBookLoaded && shouldInitAddressBook) {
      dispatch(fetchAllAddressBookAction());
    }
  }, [dispatch, isAddressBookLoaded, shouldInitAddressBook]);

  if (!isPricesLoaded || !isAddressBookLoaded) {
    return <CowLoader text={'Loading...'} />;
  }

  return (
    <Container maxWidth="lg">
      <style>
        {`
        .test-error {color: red;}
        .test { border-top: solid 2px #fff; padding-top: 1em; margin-top: 1em; }
        th { text-align: left; }
      `}
      </style>
      <TestCount />
      {breakdownIds.map(oracleId => (
        <TestBreakdown key={oracleId} oracleId={oracleId} />
      ))}
    </Container>
  );
});

type TestCountImplProps = { count: number };
const TestCountImpl = memo<TestCountImplProps>(function ({ count }) {
  const results = useAppSelector(state => {
    const lpVaults = state.entities.vaults.allIds
      .map(id => state.entities.vaults.byId[id])
      .filter(vault => vault.type === 'lps');
    const activeVaults = lpVaults.filter(vault => vault.status === 'active');
    const vaultsWithBreakdown = activeVaults.filter(
      vault => state.entities.tokens.breakdown.byOracleId[vault.id]
    );
    const vaultsWithTokens = vaultsWithBreakdown.filter(vault => {
      const breakdown = state.entities.tokens.breakdown.byOracleId[vault.id];
      return (
        breakdown.tokens.findIndex(
          token =>
            state.entities.tokens.byChainId[vault.chainId].byAddress[token.toLowerCase()] ===
            undefined
        ) === -1
      );
    });
    const vaultsWithPrices = vaultsWithTokens.filter(vault => {
      const breakdown = state.entities.tokens.breakdown.byOracleId[vault.id];
      const tokens = breakdown.tokens.map(
        token => state.entities.tokens.byChainId[vault.chainId].byAddress[token.toLowerCase()]
      );

      return (
        tokens.findIndex(
          token => !token.oracleId || !state.entities.tokens.prices.byOracleId[token.oracleId]
        ) === -1
      );
    });
    const vaultsWithImages = vaultsWithPrices.filter(vault => {
      const breakdown = state.entities.tokens.breakdown.byOracleId[vault.id];
      const tokens = breakdown.tokens.map(
        token => state.entities.tokens.byChainId[vault.chainId].byAddress[token.toLowerCase()]
      );

      return (
        tokens.findIndex(token => getSingleAssetSrc(token.symbol, token.chainId) === undefined) ===
        -1
      );
    });

    return {
      all: lpVaults.length,
      active: activeVaults.length,
      withBreakdown: vaultsWithBreakdown.length,
      withTokens: vaultsWithTokens.length,
      withPrices: vaultsWithPrices.length,
      withImages: vaultsWithImages.length,
    };
  });

  console.log(JSON.stringify(results));
  return <>{JSON.stringify(results)}</>;
});

const TestCount = memo(function () {
  const [count, setCount] = useState(0);
  const recalculate = useCallback(() => {
    setCount(count => count + 1);
  }, [setCount]);

  return (
    <>
      <button onClick={recalculate}>recalc</button>
      <TestCountImpl key={count} count={count} />
    </>
  );
});
