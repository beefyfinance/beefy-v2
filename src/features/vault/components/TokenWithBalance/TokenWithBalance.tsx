import { Box, makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../components/AssetsImage';
import { formatBigDecimals } from '../../../../helpers/format';
import { TokenEntity } from '../../../data/entities/token';
import { VaultEntity } from '../../../data/entities/vault';
import { selectUserBalanceOfToken } from '../../../data/selectors/balance';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles as any);

export function TokenWithBalance({
  token,
  vaultId,
}: {
  token: TokenEntity;
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, token.address)
  );

  return (
    <Box className={classes.balanceContainer} display="flex" alignItems="center">
      <Box lineHeight={0}>
        <AssetsImage
          chainId={vault.chainId}
          assetIds={token.address === depositToken.address ? vault.assetIds : [token.id]}
          size={16}
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
