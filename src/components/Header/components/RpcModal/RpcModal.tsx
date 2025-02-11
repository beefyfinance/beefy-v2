import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type FC,
  type MouseEventHandler,
} from 'react';
import { Menu, Edit, List, type RpcStepsProps } from './RpcSteps';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { Floating } from '../../../Floating';
import CloseIcon from '@material-ui/icons/Close';

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
    if (step === RpcStepEnum.Edit) {
      return t('RpcModal-Edit');
    }
    if (step === RpcStepEnum.List) {
      return t('RpcModal-List');
    }
    return t('RpcModal-Menu');
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

  return (
    <>
      <div className={classes.header}>
        {headerTitle}
        <CloseIcon onClick={handleClose} className={classes.cross} />
      </div>
      <div className={classes.content}>
        <StepComponent handleStep={handleStepChange} />
      </div>
    </>
  );
});

export const RpcModalTrigger = memo(function ModalTrigger() {
  const classes = useStyles();
  const anchorEl = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      setIsOpen(open => !open);
    },
    [setIsOpen]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <>
      <div ref={anchorEl} onClick={handleToggle}>
        trigger
      </div>
      <Floating
        open={isOpen}
        className={classes.dropdown}
        anchorEl={anchorEl}
        children={<RpcModal handleClose={handleClose} />}
        placement="bottom-start"
        autoWidth={false}
      />
    </>
  );
});
