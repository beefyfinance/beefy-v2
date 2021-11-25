import React from 'react';

const HideBalanceContext = React.createContext(null);

function HideBalanceProvider({ children }) {
  const [hideBalance, setHideBalance] = React.useState(() =>
    localStorage.getItem('hideBalance') === 'true' ? true : false
  );
  const value = {
    hideBalance,
    setHideBalance,
  };
  return <HideBalanceContext.Provider value={value}>{children}</HideBalanceContext.Provider>;
}

function useHideBalanceCtx() {
  const context = React.useContext(HideBalanceContext);
  if (context === undefined) {
    throw new Error('useHideBalance must be used within a HideBalanceProvider');
  }
  return context;
}

export { HideBalanceProvider, useHideBalanceCtx };
