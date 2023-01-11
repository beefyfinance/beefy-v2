import { makeStyles, useMediaQuery } from '@material-ui/core';
import { memo, PropsWithChildren } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { Tooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';
import { formatBigUsd } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { ChainEntity } from '../../../../../data/entities/chain';
import { TokenEntity } from '../../../../../data/entities/token';
import { TreasuryHoldingEntity } from '../../../../../data/entities/treasury';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AssetInfoProps {
  chainId: ChainEntity['id'];
  token: TreasuryHoldingEntity;
}

export const AssetInfo = memo<AssetInfoProps>(function ({ chainId, token }) {
  const isVault = token.assetType === 'vault';

  const isLP = token.assetType === 'token' && token.oracleType === 'lps';

  const usdValue = token.usdValue;

  //HIDE: All tokens with less than 10 usd
  if (usdValue.lt(10)) {
    return null;
  }

  if (isVault) {
    return (
      <AssetContainer token={token}>
        <VaultIdentity vaultId={token.vaultId} />
      </AssetContainer>
    );
  }

  if (isLP) {
    return (
      <AssetContainer token={token}>
        <LPidentity chainId={chainId} address={token.address} name={token.name} />
      </AssetContainer>
    );
  }

  return (
    <AssetContainer token={token}>
      <>
        <AssetsImage size={24} chainId={chainId} assetIds={[token.oracleId]} />
        <AssetName name={token.oracleId} />
      </>
    </AssetContainer>
  );
});

type AssetContainerProps = PropsWithChildren<{
  token: TreasuryHoldingEntity;
}>;

const AssetContainer = memo<AssetContainerProps>(function ({ token, children }) {
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

export const VaultIdentity = memo<VaultNameProps>(function ({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <AssetsImage size={24} chainId={vault.chainId} assetIds={vault.assetIds} />
      <AssetName name={vault.name} />
    </>
  );
});

interface LPidentityProps {
  address: TokenEntity['address'];
  chainId: ChainEntity['id'];
  name: TreasuryHoldingEntity['name'];
}

export const LPidentity = memo<LPidentityProps>(function ({ address, chainId, name }) {
  const regex = / .*?LP/g; // THIS REGEX WILL MATCH space + any chars/nothing  + "LP", for example BIFI-ETH JLP will return BIFI-ETH
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

export const AssetName = memo<AssetNameProps>(function ({ name }) {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const needTooltip = isMobile && name.length > 12;

  if (needTooltip) {
    return (
      <Tooltip content={<BasicTooltipContent title={name} />}>{`${name.slice(0, 8)}...`}</Tooltip>
    );
  }

  return <div>{name}</div>;
});
