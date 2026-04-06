import { memo, useState } from 'react';
import {
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
  Layout,
  Fit,
  Alignment,
} from '@rive-app/react-canvas';
import buttonRiv from '../../images/animations/cow_only.riv';

const LAYOUT = new Layout({
  fit: Fit.Contain,
  alignment: Alignment.CenterRight,
  layoutScaleFactor: 2,
});

const STATE_MACHINE_NAME = 'State Machine 1';

/**
 * Dev-only test harness for cow animation.
 * Toggle booleans and fire triggers to test each animation state.
 */
export const AnimatedButtonTest = memo(function AnimatedButtonTest() {
  const [isInProgressLocal, setIsInProgressLocal] = useState(false);
  const [isConfirmedLocal, setIsConfirmedLocal] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: buttonRiv,
    stateMachines: STATE_MACHINE_NAME,
    layout: LAYOUT,
    autoplay: true,
    autoBind: true,
  });

  const vmi = rive?.viewModelInstance;

  // Booleans
  const inProgress = useViewModelInstanceBoolean('isInProgress', vmi);
  const isConfirmed = useViewModelInstanceBoolean('isConfirmed', vmi);

  // Triggers
  const { trigger: triggerNeedFire } = useViewModelInstanceTrigger('needFire', vmi);
  const { trigger: triggerIsFired } = useViewModelInstanceTrigger('isFired', vmi);

  const boundValues = {
    isInProgress: inProgress.value,
    isConfirmed: isConfirmed.value,
    needFire: 'trigger',
    isFired: 'trigger',
  };

  const toggleInProgress = () => {
    const next = !isInProgressLocal;
    setIsInProgressLocal(next);
    inProgress.setValue(next);
  };

  const toggleConfirmed = () => {
    const next = !isConfirmedLocal;
    setIsConfirmedLocal(next);
    isConfirmed.setValue(next);
  };

  const resetAll = () => {
    setIsInProgressLocal(false);
    setIsConfirmedLocal(false);
    inProgress.setValue(false);
    isConfirmed.setValue(false);
  };

  // Simulate deposit: isInProgress → isConfirmed
  const simulateDeposit = async () => {
    resetAll();
    await delay(200);
    inProgress.setValue(true);
    setIsInProgressLocal(true);
    await delay(3000);
    inProgress.setValue(false);
    setIsInProgressLocal(false);
    isConfirmed.setValue(true);
    setIsConfirmedLocal(true);
  };

  // Simulate recovery: isInProgress → needFire trigger → isFired trigger
  const simulateRecovery = async () => {
    resetAll();
    await delay(200);
    inProgress.setValue(true);
    setIsInProgressLocal(true);
    await delay(2000);
    triggerNeedFire();
    await delay(2000);
    triggerIsFired();
  };

  return (
    <div style={{ padding: 24, fontFamily: 'monospace' }}>
      <h2>Cow Animation Test</h2>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div
          style={{
            width: 400,
            height: 200,
            border: '2px solid #444',
            borderRadius: 8,
            background: '#1a1a2e',
          }}
        >
          <RiveComponent style={{ width: '100%', height: '100%' }} />
        </div>
      </div>

      <h3>Booleans (toggle)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={toggleInProgress}
          style={{
            padding: '8px 16px',
            background: isInProgressLocal ? '#4caf50' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          isInProgress: {isInProgressLocal ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={toggleConfirmed}
          style={{
            padding: '8px 16px',
            background: isConfirmedLocal ? '#4caf50' : '#333',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          isConfirmed: {isConfirmedLocal ? 'ON' : 'OFF'}
        </button>
      </div>

      <h3>Triggers (fire once)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => triggerNeedFire()}
          style={{ ...actionBtnStyle, background: '#ff9800' }}
        >
          Fire needFire
        </button>
        <button
          type="button"
          onClick={() => triggerIsFired()}
          style={{ ...actionBtnStyle, background: '#f44336' }}
        >
          Fire isFired
        </button>
      </div>

      <h3>Flows</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={resetAll} style={actionBtnStyle}>
          Reset All
        </button>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <button type="button" onClick={() => simulateDeposit()} style={actionBtnStyle}>
          Simulate Deposit
        </button>
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <button type="button" onClick={() => simulateRecovery()} style={actionBtnStyle}>
          Simulate Recovery
        </button>
      </div>

      <h3>Bound values from Rive:</h3>
      <pre style={{ background: '#222', color: '#0f0', padding: 12, borderRadius: 4 }}>
        {JSON.stringify(boundValues, null, 2)}
      </pre>

      <h3>rive?.viewModelInstance:</h3>
      <pre style={{ background: '#222', color: '#0f0', padding: 12, borderRadius: 4 }}>
        {vmi ? 'Found' : 'null'}
      </pre>
    </div>
  );
});

const actionBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line no-restricted-syntax
export default AnimatedButtonTest;
