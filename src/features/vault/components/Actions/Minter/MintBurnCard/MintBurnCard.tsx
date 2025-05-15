import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectMinterById } from '../../../../../data/selectors/minters.ts';
import { Card } from '../../../Card/Card.tsx';
import { CardHeaderTabs } from '../../../Card/CardHeaderTabs.tsx';
import type { MinterCardParams } from '../MinterCard.tsx';
import { Burn } from './components/Burn.tsx';
import { Mint } from './components/Mint.tsx';

export const MintBurnCard = memo(function MintBurn({ vaultId, minterId }: MinterCardParams) {
  const { t } = useTranslation();
  const minter = useAppSelector(state => selectMinterById(state, minterId));
  const canBurn = !!minter.canBurn;
  const canMint = !minter.disableMint;
  const [mintBurn, setMintBurn] = useState(canMint ? 'mint' : 'burn');
  const options = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [];
    if (canMint) {
      opts.push({
        value: 'mint',
        label: t('action', { action: t('mint'), token: minter.mintedToken.symbol }),
      });
    }
    if (canBurn) {
      opts.push({
        value: 'burn',
        label: t('action', { action: t('burn'), token: minter.mintedToken.symbol }),
      });
    }
    return opts;
  }, [t, canMint, canBurn, minter.mintedToken.symbol]);

  return (
    <Card>
      <CardHeaderTabs selected={mintBurn} options={options} onChange={setMintBurn} />
      {mintBurn === 'mint' ?
        <Mint vaultId={vaultId} minterId={minterId} />
      : <Burn vaultId={vaultId} minterId={minterId} />}
    </Card>
  );
});
