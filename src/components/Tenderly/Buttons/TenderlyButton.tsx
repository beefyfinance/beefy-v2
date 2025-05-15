import { memo } from 'react';
import type { ChainId } from '../../../features/data/entities/chain.ts';
import { selectTenderlyMode } from '../../../features/data/selectors/tenderly.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { Button } from '../../Button/Button.tsx';
import { tenderlyChains } from '../config.ts';
import logoUrl from '../logo.svg';
import { styles } from './styles.ts';

export type TenderlyButtonProps = {
  chainId: ChainId;
  onClick: () => void;
  disabled?: boolean;
};

export const TenderlyButton = memo(function TenderlyButton({
  chainId,
  onClick,
  disabled,
}: TenderlyButtonProps) {
  const status = useAppSelector(selectTenderlyMode);

  if (tenderlyChains.has(chainId)) {
    return (
      <Button
        variant="default"
        fullWidth={true}
        onClick={onClick}
        disabled={status !== 'closed' || disabled}
        css={styles.button}
      >
        <img src={logoUrl} alt="" width={24} height={24} />
        Tenderly Simulation
      </Button>
    );
  }

  return null;
});
