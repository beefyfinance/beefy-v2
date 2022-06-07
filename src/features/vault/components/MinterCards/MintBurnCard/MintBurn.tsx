import React, { memo } from 'react';
import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../Card';
import { styles } from './styles';
import { Mint } from './components/Mint';
import { Burn } from './components/Burn';
import { MinterCardParams } from '../MinterCard';
import { selectMinterById } from '../../../../data/selectors/minters';
import clsx from 'clsx';
import { useAppSelector } from '../../../../../store';

const useStyles = makeStyles(styles as any);

export const MintBurn = memo(function MintBurn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const minter = useAppSelector(state => selectMinterById(state, minterId));

  const [mintBurn, setMintBurn] = React.useState('mint');

  const { canBurnReserves } = minter;

  return (
    <>
      <Card>
        <CardHeader
          className={clsx({ [classes.mb]: canBurnReserves, [classes.header]: !canBurnReserves })}
        >
          <>
            {canBurnReserves ? (
              <Box className={classes.tabs}>
                <Button
                  onClick={() => setMintBurn('mint')}
                  className={mintBurn === 'mint' ? classes.selected : ''}
                >
                  {t('action', { action: t('mint'), token: minter.mintedToken.symbol })}
                </Button>
                <Button
                  onClick={() => setMintBurn('burn')}
                  className={mintBurn === 'burn' ? classes.selected : ''}
                >
                  {t('action', { action: t('burn'), token: minter.mintedToken.symbol })}
                </Button>
              </Box>
            ) : (
              <>
                <img
                  className={classes.logo}
                  src={
                    require(`../../../../../images/single-assets/${minter.mintedToken.symbol}.svg`)
                      .default
                  }
                  alt={minter.mintedToken.symbol}
                />
                <Typography className={classes.title} variant="h3">
                  {t('Mint-Title', { token: minter.mintedToken.symbol })}
                </Typography>{' '}
              </>
            )}
          </>
        </CardHeader>
        {canBurnReserves ? (
          <>
            {mintBurn === 'mint' ? (
              <Mint vaultId={vaultId} minterId={minterId} />
            ) : (
              <Burn vaultId={vaultId} minterId={minterId} />
            )}
          </>
        ) : (
          <Mint vaultId={vaultId} minterId={minterId} />
        )}
      </Card>
    </>
  );
});
