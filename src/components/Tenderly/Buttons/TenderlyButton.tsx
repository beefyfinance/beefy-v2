import { memo } from 'react';
import { tenderlyChains } from '../config';
import { Button } from '../../Button';
import type { ChainId } from '../../../features/data/entities/chain';
import { useAppSelector } from '../../../store';
import { selectTenderlyMode } from '../../../features/data/selectors/tenderly';
import logoUrl from '../logo.svg';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TenderlyButtonProps = {
  chainId: ChainId;
  onClick: () => void;
  disabled?: boolean;
};

export const TenderlyButton = memo<TenderlyButtonProps>(function TenderlyButton({
  chainId,
  onClick,
  disabled,
}) {
  const classes = useStyles();
  const status = useAppSelector(selectTenderlyMode);

  if (tenderlyChains.has(chainId)) {
    return (
      <Button
        variant="default"
        fullWidth={true}
        onClick={onClick}
        disabled={status !== 'closed' || disabled}
        className={classes.button}
      >
        <img src={logoUrl} alt="" width={24} height={24} />
        Tenderly Simulation
      </Button>
    );
  }

  return null;
});
