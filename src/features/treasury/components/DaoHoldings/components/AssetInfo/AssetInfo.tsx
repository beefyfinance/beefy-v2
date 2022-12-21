import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
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
  const classes = useStyles();

  const isVault = token.assetType === 'vault';

  const isLP = token.assetType === 'token' && token.oracleType === 'lps';

  const usdValue = new BigNumber(token.usdValue);

  //HIDE: All tokens with less than 10 usd
  if (usdValue.lt(10)) {
    return null;
  }

  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>
        {isVault ? (
          <VaultIdentity vaultId={token.vaultId} />
        ) : isLP ? (
          <LPdentity chainId={chainId} address={token.address} />
        ) : (
          <>
            <AssetsImage size={24} chainId={chainId} assetIds={[token.oracleId]} />
            <div>{token.oracleId || token.name}</div>
          </>
        )}
      </div>
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
}

export const LPdentity = memo<LPdentityProps>(function ({ address, chainId }) {
  const vaultId = useAppSelector(
    state => selectStandardVaultIdsByDepositTokenAddressAddress(state, chainId, address)[0]
  );

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const assetIds = useMemo(() => {
    return vault ? vault.assetIds : ['unknown'];
  }, [vault]);

  return (
    <>
      <AssetsImage size={24} chainId={chainId} assetIds={assetIds} />
      <div>{vault.name}</div>
    </>
  );
});
