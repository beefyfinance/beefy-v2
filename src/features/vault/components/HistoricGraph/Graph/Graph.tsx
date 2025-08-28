import React from 'react';
import { ReferenceLine } from 'recharts';

export const HistoricGraphReference = ({ isClm, toggles, avg }) => (
  <>
    {!isClm && toggles.average ? (
      <ReferenceLine y={avg} stroke="#72D286" strokeWidth={1.5} strokeDasharray="3 3" />
    ) : null}
  </>
);

