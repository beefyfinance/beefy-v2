import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../components/AssetsImage';
import { formatBigDecimals } from '../../../../helpers/format';
import type { TokenEntity } from '../../../data/entities/token';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectUserBalanceOfToken } from '../../../data/selectors/balance';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress, selectVaultTokenSymbols } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

export function TokenWithBalance({
  token,
  vaultId,
  variant = 'lg',
}: {
  token: TokenEntity;
  vaultId: VaultEntity['id'];
  variant?: 'sm' | 'lg';
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, token.address)
  );
  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.id));

  return (
    <Box className={classes.balanceContainer}>
      <Box>
        <AssetsImage
          chainId={vault.chainId}
          assetIds={token.address === depositToken.address ? vaultTokenSymbols : [token.id]}
          size={variant === 'sm' ? 20 : 24}
        />
      </Box>
      <Box flexGrow={1} pl={1}>
        <div className={classes.assetCount}>
          {formatBigDecimals(balance, 8)} {token.symbol}
        </div>
      </Box>
    </Box>
  );
}
