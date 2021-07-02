const stratText = (stratType, platform, assets, want) => {
    switch (stratType) {
        case 'StratLP':
            return `
                The vault deposits the LP token in ${platform} and farms their governance token. The earned tokens are 
                sold to buy more ${assets[0]} and ${assets[1]}. The vault uses those tokens to add liquidity and get more ${want}.
                Lastly the LP tokens are redeposited in ${platform} to continue farming. The gas price is socialized between all 
                vault users and the compound happens automatically.
            `
        default:
            return "There is no description for the current strategy."
    }
}

export default stratText;