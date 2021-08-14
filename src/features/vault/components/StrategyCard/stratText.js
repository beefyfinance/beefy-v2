const stratText = (stratType, platform, assets, want, vamp, t) => {
  switch (stratType) {
    case 'StratLP':
    case 'StratMultiLP':
    case 'Vamp':
      const s_1ST = t('Strat-LP-First', { platform: platform, LPtoken: want });
      let s_mid; // eslint-disable-next-line
      switch (stratType) {
        case 'StratLP':
          s_mid = t('Strat-LP', { asset1: assets[0], asset2: assets[1], LPtoken: want });
          break;
        case 'StratMultiLP':
          s_mid = t('Strat-LP-Multi', { LPtoken: want });
          break;
        case 'Vamp':
          s_mid = t('Strat-LP-Vamp', { subPlatform: platform, topPlatform: vamp, LPtoken: want });
      }
      return s_1ST + ' ' + s_mid + ' ' + t('Strat-LP-GasCost');

    case 'Lending':
      return t('Strat-Lending', { asset: assets[0] });

    case 'SingleStake':
      return (
        t('Strat-LP-Single', { platform: platform, token: assets[0] }) + ' ' + t('Strat-LP-GasCost')
      );

    case 'Maxi':
      return t('Strat-Maxi');

    default:
      return t('Strat-Default');
  } //switch (stratType)
}; //const stratText

export default stratText;
