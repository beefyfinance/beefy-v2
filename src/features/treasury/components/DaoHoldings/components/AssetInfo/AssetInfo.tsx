import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { memo, PropsWithChildren, useMemo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { formatBigUsd } from '../../../../../../helpers/format';
import { useAppSelector } from '../../../../../../store';
import { ChainEntity } from '../../../../../data/entities/chain';
import { TokenEntity } from '../../../../../data/entities/token';
import { VaultEntity } from '../../../../../data/entities/vault';
import { TreasuryTokenHoldings } from '../../../../../data/reducers/treasury';
import {
  selectStandardVaultIdsByDepositTokenAddressAddress,
  selectVaultById,
} from '../../../../../data/selectors/vaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AssetInfoProps {
  chainId: ChainEntity['id'];
  token: TreasuryTokenHoldings;
}

export const AssetInfo = memo<AssetInfoProps>(function ({ chainId, token }) {
  const isVault = token.assetType === 'vault';

  const isLP = token.assetType === 'token' && token.oracleType === 'lps';

  const usdValue = new BigNumber(token.usdValue);

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
        <LPdentity chainId={chainId} address={token.address} name={token.name} />
      </AssetContainer>
    );
  }

  return (
    <AssetContainer token={token}>
      <>
        <AssetsImage size={24} chainId={chainId} assetIds={[token.oracleId]} />
        <div>{token.oracleId || token.name}</div>
      </>
    </AssetContainer>
  );
});

type AssetContainerProps = PropsWithChildren<{
  token: TreasuryTokenHoldings;
}>;

const AssetContainer = memo<AssetContainerProps>(function ({ token, children }) {
  const classes = useStyles();
  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>{children}</div>
      <div>
        <div className={classes.value}>
          {new BigNumber(token.balance).shiftedBy(-token.decimals).toFixed(2)}
        </div>
        <div className={classes.subValue}>{formatBigUsd(new BigNumber(token.usdValue))}</div>
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
      <div>{vault.name}</div>
    </>
  );
});

interface LPdentityProps {
  address: TokenEntity['address'];
  chainId: ChainEntity['id'];
  name: TreasuryTokenHoldings['name'];
}

export const LPdentity = memo<LPdentityProps>(function ({ address, chainId, name }) {
  const vaultId = useAppSelector(
    state => selectStandardVaultIdsByDepositTokenAddressAddress(state, chainId, address)[0]
  );

  const assets = name.replace(' LP', '').split('-');

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const assetIds = useMemo(() => {
    return vault ? vault.assetIds : assets;
  }, [assets, vault]);

  return (
    <>
      <AssetsImage size={24} chainId={chainId} assetIds={assetIds} />
      <div>{name}</div>
    </>
  );
});
