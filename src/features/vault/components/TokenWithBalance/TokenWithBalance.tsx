import { Box, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { styles } from './styles';
import { AssetsImage } from '../../../../components/AssetsImage';
import { formatBigDecimals } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { TokenEntity } from '../../../data/entities/token';
import { VaultEntity } from '../../../data/entities/vault';
import { selectUserBalanceOfToken } from '../../../data/selectors/balance';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles as any);

export function TokenWithBalance({
  token,
  vaultId,
}: {
  token: TokenEntity;
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const depositToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.tokenAddress)
  );
  const balance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, token.address)
  );

  return (
    <Box className={classes.balanceContainer} display="flex" alignItems="center">
      <Box lineHeight={0}>
        <AssetsImage
          img={token.address === depositToken.address ? vault.logoUri : null}
          assets={token.address === depositToken.address ? vault.assetIds : [token.id]}
          alt={token.id}
        />
      </Box>
      <Box flexGrow={1} pl={1} lineHeight={0}>
        <Typography className={classes.assetCount} variant={'body1'}>
          {formatBigDecimals(balance, 8)} {token.symbol}
        </Typography>
      </Box>
    </Box>
  );
}
