import { Fragment, memo, useEffect, useState } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { getSwapAggregator } from '../../../../../data/apis/instances.ts';
import type { BalancerStrategyConfig } from '../../../../../data/apis/transact/strategies/strategy-configs.ts';
import type { ISwapAggregator } from '../../../../../data/apis/transact/swap/ISwapAggregator.ts';
import { isTokenEqual, type TokenEntity } from '../../../../../data/entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../../data/entities/vault.ts';
import {
  selectIsAddressBookLoaded,
  selectTokenByAddressOrUndefined,
  selectTokenPriceByTokenOracleId,
} from '../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectIsZapLoaded } from '../../../../../data/selectors/zap.ts';
import { useAppStore } from '../../../../../data/store/store.ts';
import { isDefined } from '../../../../../data/utils/array-utils.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type BalancerZapProps = {
  vaultId: string;
};
export const BalancerZap = memo(function BalancerZap({ vaultId }: BalancerZapProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const zap =
    isStandardVault(vault) ?
      vault.zaps.find((zap): zap is BalancerStrategyConfig => zap.strategyId === 'balancer')
    : undefined;

  return (
    <div className={classes.item}>
      <h1>Balancer Zap</h1>
      {zap && isStandardVault(vault) ?
        <ZapLoader vault={vault} zap={zap} />
      : <NoZap />}
    </div>
  );
});

const NoZap = memo(function NoZap() {
  return <div>No balancer zap strategy configured</div>;
});

type ZapLoaderProps = {
  vault: VaultStandard;
  zap: BalancerStrategyConfig;
};

type ZapProps = {
  aggregatorSupportedTokens: TokenEntity[];
  vault: VaultStandard;
  zap: BalancerStrategyConfig;
};

const ZapLoader = memo(function ZapLoader({ vault, zap }: ZapLoaderProps) {
  const store = useAppStore();
  const swapLoaded = useAppSelector(
    state => selectIsZapLoaded(state) && selectIsAddressBookLoaded(state, vault.chainId)
  );
  const tokens = useAppSelector(state =>
    zap.tokens
      .map(address => selectTokenByAddressOrUndefined(state, vault.chainId, address))
      .filter(isDefined)
  );
  const [tokensSupported, setTokensSupported] = useState<TokenEntity[] | undefined>(undefined);

  useEffect(() => {
    if (swapLoaded) {
      getSwapAggregator()
        .then((aggregator: ISwapAggregator) => {
          return aggregator.fetchTokenSupport(
            tokens,
            vault.id,
            vault.chainId,
            store.getState(),
            zap.swap
          );
        })
        .then(support => {
          setTokensSupported(support.any);
        })
        .catch(error => console.error(error));

      return () => setTokensSupported(undefined);
    } else {
      setTokensSupported(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- this is dev only component
  }, [setTokensSupported, vault.id, swapLoaded]);

  if (swapLoaded && tokensSupported) {
    return <Zap vault={vault} zap={zap} aggregatorSupportedTokens={tokensSupported} />;
  }

  return <div>Loading curve zap debugger...</div>;
});

const Zap = memo(function Zap({ aggregatorSupportedTokens, vault, zap }: ZapProps) {
  const classes = useStyles();
  const tokens = useAppSelector(state =>
    zap.tokens.map(address => {
      const token = selectTokenByAddressOrUndefined(state, vault.chainId, address);
      const inAddressBook = !!token;
      const inAggregator =
        inAddressBook &&
        aggregatorSupportedTokens.some(supported => isTokenEqual(supported, token));
      const price = token ? selectTokenPriceByTokenOracleId(state, token.oracleId) : undefined;
      return { address, token, inAddressBook, inAggregator, price };
    })
  );

  return (
    <div>
      <h2>
        {zap.strategyId} - {zap.poolType}
      </h2>
      <div>{zap.poolId}</div>
      <div className={classes.grid}>
        <div className={classes.address}>Address</div>
        <div>AddressBook</div>
        <div>Price</div>
        <div>Swap</div>
        {tokens.map(token => (
          <Fragment key={token.address}>
            <div className={classes.address}>
              {token.token && token.price && token.price.gt(BIG_ZERO) ? '✔' : '❌'} {token.address}
            </div>
            <div>{token.token ? token.token.symbol : '❌'}</div>
            <div>{token.price ? formatLargeUsd(token.price) : '❌'}</div>
            <div>{token.inAggregator ? '✔' : '⚠️'}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
});
