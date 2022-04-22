import React, { memo } from 'react';
import { Box, Button, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../../Card';
import { styles } from './styles';
import { Mint } from './components/Mint';
import { Burn } from './components/Burn';
import { MinterCardParams } from '../../MinterCard';

const useStyles = makeStyles(styles as any);

// TODO this and beFTM minter cards could be refactored out to a common component
export const QiCard = memo(function QiCard({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [mb, setMb] = React.useState('mint');

  return (
    <>
      <Card>
        <CardHeader className={classes.mb}>
          <Box className={classes.tabs}>
            <Button onClick={() => setMb('mint')} className={mb === 'mint' ? classes.selected : ''}>
              {t('action', { action: t('mint'), token: 'beQI' })}
            </Button>
            <Button onClick={() => setMb('burn')} className={mb === 'burn' ? classes.selected : ''}>
              {t('action', { action: t('burn'), token: 'beQI' })}
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
