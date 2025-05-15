import { Fragment, memo, useCallback, useState } from 'react';
import {
  tenderlySimulate,
  type TenderlySimulateConfig,
} from '../../../features/data/actions/tenderly.ts';
import {
  selectTenderlyRequestOrUndefined,
  selectTenderlyStatus,
} from '../../../features/data/selectors/tenderly.ts';
import { legacyMakeStyles } from '../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../features/data/store/hooks.ts';
import { AlertError } from '../../Alerts/Alerts.tsx';
import { Button } from '../../Button/Button.tsx';
import type { ToggleButtonItem } from '../../ToggleButtons/ToggleButtons.tsx';
import { ToggleButtons } from '../../ToggleButtons/ToggleButtons.tsx';
import { ErrorMessage } from '../Error/ErrorMessage.tsx';
import { VerticalLayout } from '../Layout/VerticalLayout.tsx';
import { ExplorerAddressLink } from '../Links/ExplorerAddressLink.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

const simulationTypeOptions = [
  { value: 'full', label: 'Full' },
  { value: 'quick', label: 'Quick' },
  { value: 'abi', label: 'ABI' },
] as const satisfies Array<ToggleButtonItem<TenderlySimulateConfig['type']>>;

const simulationSaveOptions = [
  { value: 'always', label: 'Always' },
  { value: 'if-fails', label: 'Reverts Only' },
  { value: 'never', label: 'Never' },
] as const satisfies Array<ToggleButtonItem<TenderlySimulateConfig['save']>>;

export const RequestForm = memo(function RequestForm() {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const status = useAppSelector(selectTenderlyStatus);
  const request = useAppSelector(selectTenderlyRequestOrUndefined);
  const [config, setConfig] = useState<TenderlySimulateConfig>({
    type: 'full' as const,
    save: 'if-fails' as const,
  });
  const handleSimulate = useCallback(() => {
    dispatch(tenderlySimulate({ config }));
  }, [config, dispatch]);
  const handleTypeChange = useCallback(
    (type: TenderlySimulateConfig['type']) => setConfig({ ...config, type }),
    [config]
  );
  const handleSaveChange = useCallback(
    (save: TenderlySimulateConfig['save']) => setConfig({ ...config, save }),
    [config]
  );

  if (!request) {
    return <AlertError>Missing request</AlertError>;
  }

  return (
    <VerticalLayout>
      {status === 'rejected' ?
        <ErrorMessage />
      : null}
      <div>
        <div className={classes.label}>Calls</div>
        <div className={classes.calls}>
          <div className={classes.callHeader}>{'#'}</div>
          <div className={classes.callHeader}>{'Step'}</div>
          <div className={classes.callHeader}>{'To'}</div>
          <div className={classes.callHeader}>{'Data'}</div>
          {request.calls.map((call, i) => (
            <Fragment key={i}>
              <div>{i + 1}</div>
              <div>{call.step}</div>
              <div>
                <ExplorerAddressLink chainId={request.chainId} address={call.to}>
                  {call.to}
                </ExplorerAddressLink>
              </div>
              <div className={classes.callData}>{call.data}</div>
            </Fragment>
          ))}
        </div>
      </div>
      <div>
        <div className={classes.label}>Simulation Type</div>
        <ToggleButtons
          value={config.type}
          options={simulationTypeOptions}
          onChange={handleTypeChange}
        />
      </div>
      <div>
        <div className={classes.label}>Save Result</div>
        <ToggleButtons
          value={config.save}
          options={simulationSaveOptions}
          onChange={handleSaveChange}
        />
      </div>
      <Button
        variant="success"
        onClick={handleSimulate}
        disabled={status === 'pending'}
        fullWidth={true}
      >
        {status === 'pending' ? 'Simulating...' : 'Simulate'}
      </Button>
    </VerticalLayout>
  );
});
