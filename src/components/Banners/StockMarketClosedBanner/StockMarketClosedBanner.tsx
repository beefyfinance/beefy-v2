import BigNumber from 'bignumber.js';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getUnixTime } from 'date-fns';
import { fetchHistoricalPrices } from '../../../features/data/actions/historical.ts';
import type { TokenEntity } from '../../../features/data/entities/token.ts';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';
import { useStockMarketWeekend } from '../../../features/data/hooks/stock-market.ts';
import {
  getStockWeekendDifference,
  selectStockPriceAtClose,
  selectStockTokenName,
  selectVaultStockTokens,
} from '../../../features/data/selectors/stock-market.ts';
import { useAppDispatch, useAppSelector } from '../../../features/data/store/hooks.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { formatLargeUsd, formatPercent } from '../../../helpers/format.ts';
import { AssetsImage } from '../../AssetsImage/AssetsImage.tsx';
import { Banner } from '../Banner/Banner.tsx';

export type StockMarketClosedBannerProps = {
  vaultId: VaultEntity['id'];
};

export const StockMarketClosedBanner = memo(function StockMarketClosedBanner({
  vaultId,
}: StockMarketClosedBannerProps) {
  const weekend = useStockMarketWeekend();
  const stockTokens = useAppSelector(state => selectVaultStockTokens(state, vaultId));

  if (!weekend || !stockTokens.length) {
    return null;
  }

  return (
    <>
      {stockTokens.map(token => (
        <StockPriceBanner
          key={token.address}
          token={token}
          closedAtUnix={getUnixTime(weekend.closedAt)}
        />
      ))}
    </>
  );
});

type StockPriceBannerProps = {
  token: TokenEntity;
  closedAtUnix: number;
};

const StockPriceBanner = memo(function StockPriceBanner({
  token,
  closedAtUnix,
}: StockPriceBannerProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { oracleId } = token;
  const { price, closePrice, bucket, shouldLoad } = useAppSelector(state =>
    selectStockPriceAtClose(state, oracleId, closedAtUnix)
  );

  useEffect(() => {
    if (shouldLoad) {
      dispatch(fetchHistoricalPrices({ oracleId, bucket }));
    }
  }, [dispatch, oracleId, bucket, shouldLoad]);

  const difference = getStockWeekendDifference(price, closePrice);
  if (!price || !closePrice || !difference) {
    return null;
  }

  // format the magnitude and add the sign ourselves, so equal moves up and down round alike
  const sign =
    difference.gt(BIG_ZERO) ? '+'
    : difference.lt(BIG_ZERO) ? '-'
    : '';

  return (
    <Banner
      variant="warning"
      icon={<AssetsImage chainId={token.chainId} assetSymbols={[token.symbol]} size={24} />}
      text={t('Banner-StockMarketClosed', {
        name: selectStockTokenName(token),
        closePrice: formatLargeUsd(closePrice),
        price: formatLargeUsd(price),
        difference: `${sign}${formatPercent(difference.abs(), 2, BigNumber.ROUND_HALF_UP)}`,
      })}
    />
  );
});
