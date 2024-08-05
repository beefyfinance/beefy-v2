import {
  tenderlySimulate,
  type TenderlySimulateConfig,
} from '../../../features/data/actions/tenderly';
import React, { Fragment, memo, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectTenderlyRequestOrUndefined,
  selectTenderlyStatus,
} from '../../../features/data/selectors/tenderly';
import { AlertError } from '../../Alerts';
import { ToggleButtons } from '../../ToggleButtons';
import { Button } from '../../Button';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ExplorerAddressLink } from '../Links/ExplorerAddressLink';
import { VerticalLayout } from '../Layout/VerticalLayout';
import { ErrorMessage } from '../Error/ErrorMessage';

const useStyles = makeStyles(styles);

const simulationTypeOptions = {
  full: 'Full',
  quick: 'Quick',
  abi: 'ABI',
} as const satisfies Record<TenderlySimulateConfig['type'], string>;

const simulationSaveOptions = {
  always: 'Always',
  'if-fails': 'Reverts Only',
  never: 'Never',
} as const satisfies Record<TenderlySimulateConfig['save'], string>;

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
      {status === 'rejected' ? <ErrorMessage /> : null}
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
