import { makeStyles, useMediaQuery } from '@material-ui/core';
import type { PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { formatBigUsd } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import type { ChainEntity } from '../../../../../data/entities/chain';
import {
  isVaultHoldingEntity,
  type TreasuryHoldingEntity,
} from '../../../../../data/entities/treasury';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';
import { TokenImage } from '../../../../../../components/TokenImage/TokenImage';

const useStyles = makeStyles(styles);

interface AssetInfoProps {
  chainId: ChainEntity['id'];
  token: TreasuryHoldingEntity;
}

export const AssetInfo = memo<AssetInfoProps>(function AssetInfo({ chainId, token }) {
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
        <TokenImage size={24} tokenAddress={token.address} chainId={chainId} />
        <AssetName name={token.symbol} />
      </>
    </AssetContainer>
  );
});

type AssetContainerProps = PropsWithChildren<{
  token: TreasuryHoldingEntity;
}>;

const AssetContainer = memo<AssetContainerProps>(function AssetContainer({ token, children }) {
  const classes = useStyles();
  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>{children}</div>
      <div>
        <div className={classes.value}>{token.balance.shiftedBy(-token.decimals).toFixed(2)}</div>
        <div className={classes.subValue}>{formatBigUsd(token.usdValue)}</div>
      </div>
    </div>
  );
});

interface VaultNameProps {
  vaultId: VaultEntity['id'];
}

export const VaultIdentity = memo<VaultNameProps>(function VaultIdentity({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <AssetsImage size={24} chainId={vault.chainId} assetIds={vault.assetIds} />
      <AssetName name={vault.name} />
    </>
  );
});

interface LPidentityProps {
  chainId: ChainEntity['id'];
  name: TreasuryHoldingEntity['name'];
  regexType: 'lp' | 'v3';
}

export const LPidentity = memo<LPidentityProps>(function LPidentity({ chainId, name, regexType }) {
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
      <AssetsImage size={24} chainId={chainId} assetIds={assets} />
      <AssetName name={name} />
    </>
  );
});

interface AssetNameProps {
  name: string;
}

export const AssetName = memo<AssetNameProps>(function AssetName({ name }) {
  const isMobile = useMediaQuery('(max-width: 600px)', { noSsr: true });
  const needTooltip = isMobile && name.length > 12;

  if (needTooltip) {
    return (
      <Tooltip content={<BasicTooltipContent title={name} />}>{`${name.slice(0, 8)}...`}</Tooltip>
    );
  }

  return <div>{name}</div>;
});
