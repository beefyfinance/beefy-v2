import React, { memo } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../Card';
import { styles } from './styles';
import { Mint } from './components/Mint';
import { Burn } from './components/Burn';
import { MinterCardParams } from '../MinterCard';
import { useSelector } from 'react-redux';
import { selectMinterById } from '../../../../data/selectors/minters';
import { BeefyState } from '../../../../../redux-types';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export const MintBurn = memo(function MintBurn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));

  const [mintBurn, setMintBurn] = React.useState('mint');

  const { canBurnReserves } = minter;

  return (
    <>
      <Card>
        <CardHeader className={classes.header}>
          <div className={classes.tabs}>
            <Button
              onClick={() => setMintBurn('mint')}
              className={clsx(classes.tab, { [classes.selected]: mintBurn === 'mint' })}
            >
              {t('action', { action: t('mint'), token: minter.mintedToken.symbol })}
            </Button>
            {canBurnReserves ? (
              <Button
                onClick={() => setMintBurn('burn')}
                className={clsx(classes.tab, { [classes.selected]: mintBurn === 'burn' })}
              >
                {t('action', { action: t('burn'), token: minter.mintedToken.symbol })}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        {mintBurn === 'mint' ? (
          <Mint vaultId={vaultId} minterId={minterId} />
        ) : (
          <Burn vaultId={vaultId} minterId={minterId} />
        )}
      </Card>
    </>
  );
});
