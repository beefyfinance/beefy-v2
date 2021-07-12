const stratText = (stratType, platform, assets, want, vamp) => {
    switch (stratType) {
        case 'StratLP':
            return `
                The vault deposits the LP token in ${platform} and farms their governance token. The earned tokens are 
                sold to buy more ${assets[0]} and ${assets[1]}. The vault uses those tokens to add liquidity and get more ${want}.
                Lastly the LP tokens are redeposited in ${platform} to continue farming. The gas price is socialized between all 
                vault users and the compound happens automatically.
            `
        case 'StratMultiLP':
            return `
                The vault deposits the LP token in ${platform} and farms their governance token. The earned tokens are 
                sold to buy more of the underlying assets. The vault uses those tokens to add liquidity and get more ${want}.
                Lastly the LP tokens are redeposited in ${platform} to continue farming. The gas price is socialized between all 
                vault users and the compound happens automatically.
                `
        case 'Vamp':
             return `
                The vault deposits ${want} in ${vamp} and farms their governance token, while ${vamp} deposits it into ${platform} to harvest and sell the reward for more ${want}. The earned tokens are 
                sold to buy more of the underlying assets. The vault uses those tokens to add liquidity and get more ${want}.
                Lastly the ${want} is redeposited in ${vamp} to continue farming. The gas price is socialized between all 
                vault users and the compound happens automatically.
                    `
        case 'Lending':
            return `
            Liquidity protocols are decentralized marketplaces for lenders and borrowers. When a user deposits ${assets[0]} in the vault, Beefy deposits it into the liquidity protocol and borrows against the users ${assets[0]}. This is done at safe levels of collateral.
            The borrowed ${assets[0]} are then redeposited into the platform, and once again used as collateral to borrow more ${assets[0]}. This cycle is repeated multiple times to generate as much interest as possible to buy more ${assets[0]}. It is noteworthy that this "leveraged" multi lending and multi borrowing is only with the ${assets[0]}, so there is no liquidation risk due to token price swings. Also, because of the multi supply/borrow cycle, a transaction fee for these vaults is generally 4x as high as compared to other vaults.
            Because of accruing debt/supply interest, one may notice that the ${assets[0]} amount may decline ever so slightly in between harvests. After the harvest, you will see your ${assets[0]} amount go up as the yields are compounded back into it.
                `
        case 'SingleStake':
            return `
            The vault deposits the ${assets[0]} in ${platform} and farms for more ${assets[0]}. The earned ${assets[0]} are 
            then deposited back into the ${assets[0]} farm. The gas price is socialized between all 
            vault users and the compound happens automatically.
                `
        case 'Maxi':
            return `
            The BIFI Maxi vault allows users to stake their BIFI much like in the RewardPool, but receive instead their rewards in BIFI. By staking their BIFI, each participant converts and compounds their share of the protocol’s revenue into more BIFI tokens. As no more BIFI tokens are to be minted, these are provided to stakers by buying BIFI from the open market with the networks native token.
                 `
        default:
            return "There is no description for the current strategy."
    }
}

export default stratText;