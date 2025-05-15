import { memo } from 'react';
import Refresh from '../../../../../../../images/icons/mui/Refresh.svg?react';
import ErrorOutline from '../../../../../../../images/icons/mui/ErrorOutline.svg?react';
import { refreshRecipe } from './styles.ts';
import { BasicTooltipContent } from '../../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { DivWithTooltip } from '../../../../../../../components/Tooltip/DivWithTooltip.tsx';

type RefreshButtonProps = {
  title: string;
  text?: string;
  status: 'loading' | 'loaded' | 'error';
  disabled?: boolean;
  onClick?: () => void;
};

export const RefreshButton = memo(function RefreshButton({
  title,
  text,
  status,
  onClick,
  disabled,
}: RefreshButtonProps) {
  const isDisabled = disabled === undefined ? !onClick : disabled;
  const canLoad = !isDisabled && !!onClick;
  const classes = refreshRecipe({ status, canLoad });

  return (
    <div className={classes.container}>
      <DivWithTooltip tooltip={<BasicTooltipContent title={title} content={text} />}>
        <button type="button" disabled={isDisabled} onClick={onClick} className={classes.button}>
          {status === 'error' && !canLoad ?
            <ErrorOutline className={classes.icon} />
          : <Refresh className={classes.icon} />}
        </button>
      </DivWithTooltip>
    </div>
  );
});
