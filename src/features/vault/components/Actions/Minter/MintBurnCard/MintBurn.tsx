import React, { memo } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../../Card';
import { styles } from './styles';
import { Mint } from './components/Mint';
import { Burn } from './components/Burn';
import { MinterCardParams } from '../MinterCard';
import { selectMinterById } from '../../../../../data/selectors/minters';
import clsx from 'clsx';
import { useAppSelector } from '../../../../../../store';

const useStyles = makeStyles(styles);

export const MintBurn = memo(function MintBurn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const minter = useAppSelector(state => selectMinterById(state, minterId));

  const [mintBurn, setMintBurn] = React.useState('mint');

  const { canBurnReserves } = minter;

  return (
    <>
      <Card>
        <CardHeader disableDefaultClass={true} className={classes.header}>
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
