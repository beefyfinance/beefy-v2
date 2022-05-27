import { Box, makeStyles } from '@material-ui/core';
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
import clsx from 'clsx';

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
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const depositToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const balance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, token.address)
  );

  return (
    <Box
      className={clsx(classes.balanceContainer, { [classes.sm]: variant === 'sm' })}
      display="flex"
      alignItems="center"
    >
      <Box lineHeight={0}>
        <AssetsImage
          chainId={vault.chainId}
          assetIds={token.address === depositToken.address ? vault.assetIds : [token.id]}
          size={20}
        />
      </Box>
      <Box flexGrow={1} pl={1} lineHeight={0}>
        <div className={classes.assetCount}>
          {formatBigDecimals(balance, 8)} {token.symbol}
        </div>
      </Box>
    </Box>
  );
}
