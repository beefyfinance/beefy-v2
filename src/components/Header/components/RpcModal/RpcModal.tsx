import {
  memo,
  useCallback,
  useMemo,
  useState,
  type FC,
  type MouseEventHandler,
  type RefObject,
} from 'react';
import { Menu, Edit, List, type RpcStepsProps } from './RpcSteps';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { Floating } from '../../../Floating';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as SettingsIcon } from '../../../../images/icons/settings.svg';
import { ReactComponent as BackArrow } from '../../../../images/back-arrow.svg';

const useStyles = makeStyles(styles);

enum RpcStepEnum {
  Menu = 1,
  Edit,
  List,
}

const stepToComponent: Record<RpcStepEnum, FC<RpcStepsProps>> = {
  [RpcStepEnum.Menu]: Menu,
  [RpcStepEnum.Edit]: Edit,
  [RpcStepEnum.List]: List,
};

export const RpcModal = memo(function RpcModal({ handleClose }: { handleClose: () => void }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [step, setStep] = useState<RpcStepEnum>(RpcStepEnum.Menu);

  const headerTitle = useMemo(() => {
    if (step === RpcStepEnum.List) {
      return t('RpcModal-List');
    }
    return t('RpcModal-Menu-Edit');
  }, [step, t]);

  const handleStepChange = useCallback(() => {
    if (step === RpcStepEnum.Menu) {
      setStep(RpcStepEnum.List);
    }

    if (step === RpcStepEnum.List) {
      setStep(RpcStepEnum.Edit);
    }

    if (step === RpcStepEnum.Edit) {
      setStep(RpcStepEnum.Menu);
    }
  }, [step]);

  const StepComponent = useMemo(() => stepToComponent[step], [step]);

  const showStepBack = useMemo(
    () => step === RpcStepEnum.List || step === RpcStepEnum.Edit,
    [step]
  );

  const onBack = useCallback(() => {}, []);

  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          {showStepBack && (
            <button onClick={onBack} className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
          )}
          {headerTitle}
        </div>
        <CloseIcon onClick={handleClose} className={classes.cross} />
      </div>
      <div className={classes.content}>
        <StepComponent handleStep={handleStepChange} />
      </div>
    </>
  );
});

export const RpcModalTrigger = memo(function ModalTrigger({
  anchorEl,
  isOpen,
  handleIsOpen,
  handleClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  handleIsOpen: () => void;
  handleClose: () => void;
}) {
  const classes = useStyles();

  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      handleIsOpen();
    },
    [handleIsOpen]
  );

  return (
    <>
      <div className={classes.container} onClick={handleToggle}>
        <SettingsIcon height={24} width={24} />
        <div className={classes.line} />
      </div>
      <ClickAwayListener
        onClickAway={handleClose}
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
      >
        <Floating
          open={isOpen}
          className={classes.dropdown}
          anchorEl={anchorEl}
          children={<RpcModal handleClose={handleClose} />}
          placement="bottom-end"
          autoWidth={false}
        />
      </ClickAwayListener>
    </>
  );
});
