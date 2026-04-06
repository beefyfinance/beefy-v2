import {
  type ComponentProps,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas';
import { css } from '@repo/styles/css';
import buttonRiv from '../../images/animations/cow_only.riv';
import { Button } from './Button.tsx';

const LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.TopRight,
  layoutScaleFactor: 4,
});

const STATE_MACHINE_NAME = 'State Machine 1';

// ---------------------------------------------------------------------------
// Cow animation state context — single persistent Rive instance shared
// across all AnimatedButton instances within a CowAnimationProvider.
// ---------------------------------------------------------------------------

type CowState = {
  depositInProgress: boolean;
  fireNeedFire: boolean;
  fireIsFired: boolean;
  isConfirmed: boolean;
};

const DEFAULT_COW_STATE: CowState = {
  depositInProgress: false,
  fireNeedFire: false,
  fireIsFired: false,
  isConfirmed: false,
};

type CowContextValue = {
  state: CowState;
  setState: (state: CowState) => void;
  registerPortalTarget: (el: HTMLDivElement | null) => void;
  unregisterPortalTarget: (el: HTMLDivElement | null) => void;
};

const CowContext = createContext<CowContextValue>({
  state: DEFAULT_COW_STATE,
  setState: () => {},
  registerPortalTarget: () => {},
  unregisterPortalTarget: () => {},
});

/**
 * Wrap a group of AnimatedButtons so they share a single persistent cow
 * animation that doesn't remount when the active button component changes.
 */
export const CowAnimationProvider = memo(function CowAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CowState>(DEFAULT_COW_STATE);
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null);

  // Use a stack so when old unmounts and new mounts in the same batch,
  // we always have the latest target without a null gap.
  const targetsRef = useRef<(HTMLDivElement | null)[]>([]);

  const registerPortalTarget = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      targetsRef.current.push(el);
      setPortalTarget(el);
    }
  }, []);

  const unregisterPortalTarget = useCallback((el: HTMLDivElement | null) => {
    targetsRef.current = targetsRef.current.filter(t => t !== el);
    // Use the latest remaining target, or null if none
    const latest = targetsRef.current[targetsRef.current.length - 1] ?? null;
    setPortalTarget(latest);
  }, []);

  const contextValue = useMemo(
    () => ({ state, setState, registerPortalTarget, unregisterPortalTarget }),
    [state, registerPortalTarget, unregisterPortalTarget]
  );

  const showCow =
    state.depositInProgress || state.fireNeedFire || state.fireIsFired || state.isConfirmed;

  return (
    <CowContext.Provider value={contextValue}>
      {children}
      {showCow && portalTarget && createPortal(<RiveAnimation {...state} />, portalTarget)}
    </CowContext.Provider>
  );
});

// ---------------------------------------------------------------------------
// RiveAnimation — single instance driven by context state
// ---------------------------------------------------------------------------

const RiveAnimation = memo(function RiveAnimation({
  depositInProgress,
  fireNeedFire,
  fireIsFired,
  isConfirmed,
}: CowState) {
  const { rive, RiveComponent } = useRive({
    src: buttonRiv,
    stateMachines: STATE_MACHINE_NAME,
    layout: LAYOUT,
    autoplay: true,
    autoBind: true,
  });

  const vmi = rive?.viewModelInstance;

  const { setValue: setInProgress } = useViewModelInstanceBoolean('isInProgress', vmi);
  const { setValue: setIsConfirmed } = useViewModelInstanceBoolean('isConfirmed', vmi);
  const { trigger: triggerNeedFire } = useViewModelInstanceTrigger('needFire', vmi);
  const { trigger: triggerIsFired } = useViewModelInstanceTrigger('isFired', vmi);

  const prevRef = useRef({ fireNeedFire: false, fireIsFired: false });

  useEffect(() => {
    setInProgress(depositInProgress);
  }, [setInProgress, depositInProgress]);

  useEffect(() => {
    if (fireNeedFire && !prevRef.current.fireNeedFire) {
      triggerNeedFire();
    }
    prevRef.current.fireNeedFire = fireNeedFire;
  }, [triggerNeedFire, fireNeedFire]);

  useEffect(() => {
    if (fireIsFired && !prevRef.current.fireIsFired) {
      triggerIsFired();
    }
    prevRef.current.fireIsFired = fireIsFired;
  }, [triggerIsFired, fireIsFired]);

  useEffect(() => {
    setIsConfirmed(isConfirmed);
  }, [setIsConfirmed, isConfirmed]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
});

// ---------------------------------------------------------------------------
// AnimatedButton — renders a Button with a portal target for the cow canvas
// ---------------------------------------------------------------------------

type AnimatedButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  isCreating?: boolean;
  needFire?: boolean;
  isConfirmed?: boolean;
};

export const AnimatedButton = memo(function AnimatedButton({
  loading,
  children,
  disabled,
  isCreating,
  needFire,
  isConfirmed,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const { setState, registerPortalTarget, unregisterPortalTarget } = useContext(CowContext);
  const [isFired, setIsFired] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      if (needFire) {
        setIsFired(true);
      }
      onClick?.(e);
    },
    [needFire, onClick]
  );

  // Reset isFired when needFire goes away
  useEffect(() => {
    if (!needFire) {
      setIsFired(false);
    }
  }, [needFire]);

  // Register/unregister this button's portal target
  useEffect(() => {
    const el = portalRef.current;
    registerPortalTarget(el);
    return () => unregisterPortalTarget(el);
  }, [registerPortalTarget, unregisterPortalTarget]);

  // Sync state to the shared cow context
  useEffect(() => {
    setState({
      depositInProgress: (!!loading || !!isCreating) && !needFire && !isFired,
      fireNeedFire: !!needFire,
      fireIsFired: isFired,
      isConfirmed: !!isConfirmed,
    });
  }, [setState, loading, isCreating, needFire, isFired, isConfirmed]);

  return (
    <div className={wrapperClass}>
      <Button {...props} disabled={loading || disabled} onClick={handleClick}>
        {children}
      </Button>
      <div ref={portalRef} className={riveCornerClass} />
    </div>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const wrapperClass = css({
  position: 'relative',
  width: '100%',
});

const riveCornerClass = css({
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '250%',
  height: '250%',
  pointerEvents: 'none',
});
