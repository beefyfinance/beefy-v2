import {
  type FC,
  memo,
  type MouseEventHandler,
  type RefObject,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Edit, Menu, type RpcStepsProps } from './RpcSteps';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { Floating } from '../../../Floating';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as SettingsIcon } from '../../../../images/icons/settings.svg';
import { ReactComponent as BackArrow } from '../../../../images/back-arrow.svg';
import type { ChainEntity } from '../../../../features/data/entities/chain';

const useStyles = makeStyles(styles);

export enum RpcStepEnum {
  Menu = 1,
  Edit,
}

const stepToComponent: Record<RpcStepEnum, FC<RpcStepsProps>> = {
  [RpcStepEnum.Menu]: Menu,
  [RpcStepEnum.Edit]: Edit,
};

export const RpcModal = memo(function RpcModal({ handleClose }: { handleClose: () => void }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [step, setStep] = useState<RpcStepEnum>(RpcStepEnum.Menu);
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);

  const handleStepChange = useCallback((nextStep: RpcStepEnum) => {
    setStep(nextStep);
  }, []);

  const handleEditChainId = useCallback(
    (chainId: ChainEntity['id'] | null) => {
      setEditChainId(chainId);
    },
    [setEditChainId]
  );

  const StepComponent = useMemo(() => stepToComponent[step], [step]);

  const showStepBack = useMemo(() => step === RpcStepEnum.Edit, [step]);

  const onBack = useCallback(() => {
    setStep(RpcStepEnum.Menu); // Go back to Menu
  }, []);

  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          {showStepBack && (
            <button onClick={onBack} className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
          )}
          {t('RpcModal-Menu-Edit')}
        </div>
        <CloseIcon onClick={handleClose} className={classes.cross} />
      </div>
      <div className={classes.content}>
        <StepComponent
          handleStep={handleStepChange}
          editChainId={editChainId}
          setEditChainId={handleEditChainId}
        />
      </div>
    </>
  );
});

export const RpcModalTrigger = memo(function ModalTrigger({
  anchorEl,
  isOpen,
  onOpen,
  onClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const classes = useStyles();

  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      onOpen();
    },
    [onOpen]
  );

  const handleClickAway = useCallback(() => {
    if (isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  return (
    <ClickAwayListener
      onClickAway={handleClickAway}
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
    >
      <div>
        <div className={classes.container} onClick={handleToggle}>
          <SettingsIcon height={24} width={24} />
          <div className={classes.line} />
        </div>
        <Floating
          open={isOpen}
          className={classes.dropdown}
          anchorEl={anchorEl}
          children={<RpcModal handleClose={onClose} />}
          placement="bottom-end"
          autoWidth={false}
        />
      </div>
    </ClickAwayListener>
  );
});
