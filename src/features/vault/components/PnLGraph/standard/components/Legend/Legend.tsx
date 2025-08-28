import React from 'react';

export const Legend = ({ t, isSingleAssetVault, vault }: any) => (
  <div>
    <div>
      <span style={{ background: '#72D286', width: 8, height: 8, display: 'inline-block', marginRight: 8 }} />
      {t(
        isSingleAssetVault ? 'pnl-graph-legend-amount-single' : 'pnl-graph-legend-amount-lp',
        {
          token: vault.assetIds[0],
        }
      )}
    </div>
    <div>
      <span style={{ background: '#5C70D6', width: 8, height: 8, display: 'inline-block', marginRight: 8 }} />
      {t('pnl-graph-legend-usd')}
    </div>
  </div>
);

export default Legend;

