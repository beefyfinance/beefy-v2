import type { PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { useMediaQuery } from '../../../../../../components/MediaQueries/useMediaQuery.ts';
import { TokenImage, VaultImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { DivWithTooltip } from '../../../../../../components/Tooltip/DivWithTooltip.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import {
  isVaultHoldingEntity,
  type MarketMakerHoldingEntity,
  type TreasuryHoldingEntity,
} from '../../../../../data/entities/treasury.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface AssetInfoProps {
  chainId: ChainEntity['id'];
  token: TreasuryHoldingEntity;
}

interface MMAssetInfoProps {
  holding: MarketMakerHoldingEntity;
}

export const AssetInfo = memo(function AssetInfo({ chainId, token }: AssetInfoProps) {
  const isV3 = useMemo(() => {
    return token.assetType === 'concLiquidity' && token.oracleType === 'lps';
  }, [token.assetType, token.oracleType]);

  const isLP = useMemo(() => {
    return token.assetType === 'token' && token.oracleType === 'lps';
  }, [token.assetType, token.oracleType]);

  if (isV3) {
    return (
      <AssetContainer token={token}>
        <LPidentity regexType="v3" chainId={chainId} name={token.name} />
      </AssetContainer>
    );
  }

  if (isVaultHoldingEntity(token)) {
    return (
      <AssetContainer token={token}>
        <VaultIdentity vaultId={token.vaultId} />
      </AssetContainer>
    );
  }

  if (isLP) {
    return (
      <AssetContainer token={token}>
        <LPidentity regexType="lp" chainId={chainId} name={token.name} />
      </AssetContainer>
    );
  }

  return (
    <AssetContainer token={token}>
      <>
        <TokenImage size={24} address={token.address} chainId={chainId} />
        <AssetName name={token.symbol} />
      </>
    </AssetContainer>
  );
});

type AssetContainerProps = PropsWithChildren<{
  token: TreasuryHoldingEntity;
}>;

const AssetContainer = memo(function AssetContainer({ token, children }: AssetContainerProps) {
  const classes = useStyles();
  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>{children}</div>
      <div>
        <div className={classes.value}>{token.balance.shiftedBy(-token.decimals).toFixed(2)}</div>
        <div className={classes.subValue}>{formatLargeUsd(token.usdValue)}</div>
      </div>
    </div>
  );
});

interface VaultNameProps {
  vaultId: VaultEntity['id'];
}

export const VaultIdentity = memo(function VaultIdentity({ vaultId }: VaultNameProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <VaultImage vault={vault} size={24} />
      <AssetName name={vault.names.list} />
    </>
  );
});

interface LPidentityProps {
  chainId: ChainEntity['id'];
  name: TreasuryHoldingEntity['name'];
  regexType: 'lp' | 'v3';
}

export const LPidentity = memo(function LPidentity({ chainId, name, regexType }: LPidentityProps) {
  // THIS REGEX WILL MATCH space + any chars/nothing  + "LP", for example BIFI-ETH JLP will return BIFI-ETH
  const regex: RegExp = useMemo(() => {
    if (regexType === 'lp') {
      return / .*?LP/g;
    } else {
      return / .*?V3/g;
    }
  }, [regexType]);

  const assets = name.replace(regex, '').split('-');

  return (
    <>
      <AssetsImage size={24} chainId={chainId} assetSymbols={assets} />
      <AssetName name={name} />
    </>
  );
});

interface AssetNameProps {
  name: string;
}

export const AssetName = memo(function AssetName({ name }: AssetNameProps) {
  const isMobile = useMediaQuery('(max-width: 600px)', false);
  const needTooltip = isMobile && name.length > 12;

  if (needTooltip) {
    return (
      <DivWithTooltip tooltip={<BasicTooltipContent title={name} />}>
        {`${name.slice(0, 8)}...`}
      </DivWithTooltip>
    );
  }

  return <div>{name}</div>;
});

// MM Assets
export const AssetInfoMM = memo(function AssetInfoMM({ holding }: MMAssetInfoProps) {
  return (
    <MMAssetContainer holding={holding}>
      <>
        <AssetsImage chainId={'ethereum'} size={24} assetSymbols={[holding.symbol]} />
        <AssetName name={holding.symbol} />
      </>
    </MMAssetContainer>
  );
});

type MMAssetContainerProps = PropsWithChildren<{
  holding: MarketMakerHoldingEntity;
}>;

const MMAssetContainer = memo(function AssetContainer({
  holding,
  children,
}: MMAssetContainerProps) {
  const classes = useStyles();
  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>{children}</div>
      <div>
        <div className={classes.value}>{holding.balance.toFixed(2)}</div>
        <div className={classes.subValue}>{formatLargeUsd(holding.usdValue)}</div>
      </div>
    </div>
  );
});
