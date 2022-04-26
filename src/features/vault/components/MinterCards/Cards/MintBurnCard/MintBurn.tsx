import React, { memo } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../../Card';
import { styles } from './styles';
import { Mint } from './components/Mint';
import { Burn } from './components/Burn';
import { MinterCardParams } from '../../MinterCard';
import { useSelector } from 'react-redux';
import { selectMinterById } from '../../../../../data/selectors/minters';
import { BeefyState } from '../../../../../../redux-types';

const useStyles = makeStyles(styles as any);

export const MintBurn = memo(function MintBurn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));

  const [mb, setMb] = React.useState('mint');

  return (
    <>
      <Card>
        <CardHeader className={classes.mb}>
          <Box className={classes.tabs}>
            <Button onClick={() => setMb('mint')} className={mb === 'mint' ? classes.selected : ''}>
              {t('action', { action: t('mint'), token: minter.mintedToken.symbol })}
            </Button>
            <Button onClick={() => setMb('burn')} className={mb === 'burn' ? classes.selected : ''}>
              {t('action', { action: t('burn'), token: minter.mintedToken.symbol })}
            </Button>
          </Box>
          {mb === 'mint' ? (
            <Mint vaultId={vaultId} minterId={minterId} />
          ) : (
            <Burn vaultId={vaultId} minterId={minterId} />
          )}
        </CardHeader>
      </Card>
    </>
  );
});
