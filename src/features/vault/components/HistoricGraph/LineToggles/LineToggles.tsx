import React from 'react';
import LineToggle from '../LineToggle/LineToggle';

export const LineToggles = ({ toggles, handleChange, t }: any) => (
  <LineToggle
    checked={toggles.average}
    color="#72D286"
    label={t('Average')}
    onChange={handleChange}
    toggle={'average'}
  />
);

export default LineToggles;

