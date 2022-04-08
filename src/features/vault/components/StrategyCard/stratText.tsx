export const stratText = (stratType, platform, assets, want, vamp, t) => {
  switch (stratType) {
    case 'StratLP':
    case 'StratMultiLP':
    case 'Vamp':
      const firstPart = t(platform === 'Other' ? 'Strat-LP-First-Other' : 'Strat-LP-First', {
        platform: platform,
        LPtoken: want,
      });
      let middlePart = '';
      switch (stratType) {
        case 'StratLP':
          middlePart = t('Strat-LP', { asset1: assets[0], asset2: assets[1], LPtoken: want });
          break;
        case 'StratMultiLP':
          middlePart = t('Strat-LP-Multi', { LPtoken: want });
          break;
        case 'Vamp':
          middlePart = t('Strat-LP-Vamp', {
            subPlatform: platform,
            topPlatform: vamp,
            LPtoken: want,
          });
          break;
      }
      return firstPart + ' ' + middlePart + ' ' + t('Strat-LP-GasCost');

    case 'Lending':
      return t('Strat-Lending', { asset: assets[0] });

    case 'SingleStake':
      return (
        t(platform === 'Other' ? 'Strat-Single-Other' : 'Strat-Single', {
          platform: platform,
          token: assets[0],
        }) +
        ' ' +
        t('Strat-LP-GasCost')
      );

    case 'Maxi':
      return t('Strat-Maxi');

    default:
      return t('Strat-Default');
  } //switch (stratType)
}; //const stratText
