import React from 'react';

export function NightMode(method) {
  const [isNightMode, setNightMode] = React.useState(false);

  if (method === 'get') {
    return isNightMode;
  } else {
    return setNightMode(!isNightMode);
  }
}
