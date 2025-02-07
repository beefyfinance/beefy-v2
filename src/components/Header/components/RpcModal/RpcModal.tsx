import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type FC,
  type MouseEventHandler,
} from 'react';
import { Menu, Edit, List } from './RpcSteps';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { Floating } from '../../../Floating';

const useStyles = makeStyles(styles);

enum RpcStepEnum {
  Menu = 1,
  Edit,
  List,
}

const stepToComponent: Record<RpcStepEnum, FC> = {
  [RpcStepEnum.Menu]: Menu,
  [RpcStepEnum.Edit]: Edit,
  [RpcStepEnum.List]: List,
};

export const RpcModal = memo(function RpcModal() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [step, setStep] = useState<RpcStepEnum>(RpcStepEnum.Menu);

  const headerTitle = useMemo(() => {
    if (step === RpcStepEnum.Edit) {
      return t('RpcModal-Menu');
    }
    if (step === RpcStepEnum.List) {
      return t('RpcEdit-Edit');
    }
    return t('RpcEdit-Menu');
  }, [step, t]);

  const _handleStepChange = useCallback((newStep: RpcStepEnum) => {
    setStep(newStep);
  }, []);

  const StepComponent = useMemo(() => stepToComponent[step], [step]);

  return (
    <div className={classes.rpcModal}>
      <div className={classes.header}>{headerTitle}</div>
      <div className={classes.content}>
        <StepComponent />
      </div>
    </div>
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

  return (
    <>
      <div ref={anchorEl} onClick={handleToggle}>
        trigger
      </div>
      <Floating
        open={isOpen}
        className={classes.rpcModal}
        anchorEl={anchorEl}
        children={<RpcModal />}
        placement="bottom-start"
        autoWidth={false}
      />
    </>
  );
});
